import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin, fromEvent, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LngLatBounds, Map, Marker, NavigationControl } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { environment } from '../../../../environments/environment';
import { AnnotationEntityService } from './annotation-entity.service';
import { AnnotationType, IAnnotation, IDrawCreateEvent, MapboxOutput } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  map: Map;
  draw;
  marker: Marker;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 32.0853;
  lng = 34.7818;
  activeId: string;

  constructor(private http: HttpClient, private annotationService: AnnotationEntityService) {
  }

  createMap(): void {
    this.map = new Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      zoom: 13,
      style: this.style,
      center: [this.lng, this.lat]
    });
    // Add map controls
    this.map.addControl(new NavigationControl());

    this.addDrawFunctionality();

    this.addListeners();

  }

  addDrawFunctionality(): void {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        point: true,
        line_string: true
      }
    });
    this.map.addControl(this.draw, 'top-left');
  }

  addListeners(): void {
    this.map.on('draw.selectionchange', (e) => {
      const id = e.features[0]?.id;
      this.updateAnnotation(id);
    });

    fromEvent(this.map, 'draw.create').pipe(map((event: IDrawCreateEvent) => event.features[0])).subscribe((createdEl) => {
      switch (createdEl.geometry.type) {
        case AnnotationType.Point: {
          this.onPointCreate(createdEl);
          break;
        }

        case AnnotationType.Polygon: {
          this.onPolygonCreate(createdEl);
          break;
        }

        case AnnotationType.LineString: {
          this.onLineStringCreate(createdEl);
          break;
        }
      }
    });
  }

  onPointCreate(createdEl): void {
    const [lng, lat] = createdEl.geometry.coordinates;
    this.searchPlaceByCoordinates([lng, lat]).subscribe(point => {
      this.addToStore(createdEl.id, point.geometry.coordinates, point.place_name, createdEl.geometry.type);
    });
  }

  onPolygonCreate(createdEl): void {
    const bounds = createdEl.geometry.coordinates[0].reduce((bound, coord) => {
      return bound.extend(coord);
    }, new LngLatBounds(createdEl.geometry.coordinates[0][0], createdEl.geometry.coordinates[0][0]));

    const polygonBounds = new LngLatBounds(createdEl.geometry.coordinates[0]);
    const coords = polygonBounds.getCenter().toArray();

    this.searchPlaceByCoordinates(coords).subscribe(data => {
      this.addToStore(createdEl.id, bounds, `Polygon Center: ${data.text}`, createdEl.geometry.type);
    });
  }

  onLineStringCreate(createdEl): void {
    const firstEndPoint = this.searchPlaceByCoordinates(createdEl.geometry.coordinates[0]);
    const secondEndPoint = this.searchPlaceByCoordinates(createdEl.geometry.coordinates[createdEl.geometry.coordinates.length - 1]);
    forkJoin([firstEndPoint, secondEndPoint]).subscribe(data => {
      const name = `Line: ${data[0].text} - ${data[1].text}`;
      const coords = createdEl.geometry.coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new LngLatBounds(createdEl.geometry.coordinates[0], createdEl.geometry.coordinates[0]));
      this.addToStore(createdEl.id, coords, name, createdEl.geometry.type);
    });
  }

  addToStore(id, coordinates, name, type): void {
    const annotation: IAnnotation = {
      id,
      coordinates,
      name,
      type,
      isActive: true
    };
    this.annotationService.addOneToCache(annotation);
  }

  searchPlaceByText(place: string): Observable<any> {
    this.marker?.remove();
    return this.http.get<MapboxOutput>(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?
    types=address&access_token=${environment.mapbox.accessToken}`).pipe(
      map((res) => res.features),
      tap(searchedData => {
        this.setMarkerAndFit(searchedData);
      })
    );
  }

  searchPlaceByCoordinates(coords: number[], type = 'poi'): Observable<any> {
    return this.http.get<MapboxOutput>(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.join(',')}.json?types=${type}&language=en&&access_token=${environment.mapbox.accessToken}`).pipe(
      map(point => point.features[0])
    );
  }

  setMarkerAndFit(searchedData): void {
    this.marker?.remove();
    this.marker = new Marker()
      .setLngLat([searchedData[0].center[0], searchedData[0].center[1]])
      .addTo(this.map);
    if (searchedData[0].bbox) {
      this.fitToArea(searchedData[0].bbox);
    }
    else {
      this.fitToPoint(searchedData[0].center);
    }
  }

  fitToArea(coords): void {
    this.map.fitBounds(coords, {
      padding: 100,
    });
  }

  fitToPoint(coords): void {
    this.map.flyTo({
      center: coords,
      zoom: 13
    });
  }

  selectOnMap(id: string): void {
    this.draw.changeMode('simple_select', {featureIds: [id]});
  }

  flyTo(annotation: IAnnotation): void {
    this.updateAnnotation(annotation.id);
    this.selectOnMap(annotation.id);

    switch (annotation.type) {
      case AnnotationType.Point:
        this.fitToPoint(annotation.coordinates);
        break;
      case AnnotationType.LineString:
      case AnnotationType.Polygon:
        this.fitToArea(annotation.coordinates);
        break;
    }
  }

  updateAnnotation(id: string): void {
    if (id) {
      const previousSelection = {
        id: this.activeId,
        isActive: false
      };
      const newSelection = {
        id,
        isActive: true
      };
      if (this.activeId) {
        this.annotationService.updateManyInCache([newSelection, previousSelection]);
      } else {
        this.annotationService.updateOneInCache(newSelection);
      }
      this.activeId = id;
    }
    else {
      // remove selection
      const newSelection = {
        id: this.activeId,
        isActive: false
      };
      this.annotationService.updateOneInCache(newSelection);
      this.activeId = null;
    }
  }

  deleteAnnotationFromStore(id: string): void {
    this.draw.delete(id);
    this.annotationService.removeOneFromCache(id);
  }
}
