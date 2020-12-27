import { Component, OnInit } from '@angular/core';
import { MapService } from '../../providers/map.service';
import { Observable } from 'rxjs';

import { AnnotationEntityService } from '../../providers/annotation-entity.service';
import { IAnnotation } from '../../models';

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss']
})
export class InfoPanelComponent implements OnInit {
  searchText: string;
  annotationList$: Observable<IAnnotation[]>;

  constructor(private mapService: MapService, private annotationService: AnnotationEntityService) {
  }

  ngOnInit(): void {
    this.annotationList$ = this.annotationService.entities$;
  }

  searchPlace(): void {
    this.mapService.searchPlaceByText(this.searchText).subscribe();
  }

}
