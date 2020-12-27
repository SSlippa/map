import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs';

import { IAnnotation } from '../../../../models';
import { MapService } from '../../../../providers/map.service';

@Component({
  selector: 'app-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.scss']
})
export class AnnotationListComponent implements OnInit {
  @Input() itemsList$: Observable<IAnnotation[]>;
  @Output() itemClicked = new EventEmitter<IAnnotation>();

  constructor(private mapService: MapService) { }

  ngOnInit(): void {
  }

  onItemClick(item: IAnnotation): void {
    this.mapService.flyTo(item);
  }

  deleteItem(item: IAnnotation): void {
    this.mapService.deleteAnnotationFromStore(item.id);
  }

}
