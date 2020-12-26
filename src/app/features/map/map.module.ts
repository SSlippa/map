import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { EntityDefinitionService, EntityMetadataMap } from '@ngrx/data';

import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { LayoutContainerComponent } from './containers/layout-container/layout-container.component';
import { MapComponent } from './components/map/map.component';
import { AnnotationEntityService } from './providers/annotation-entity.service';
import { MapService } from './providers/map.service';
import { AnnotationListComponent } from './components/info-panel/components/annotation-list/annotation-list.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutContainerComponent
  }
];

const entityMetadata: EntityMetadataMap = {
  Annotation: {},
};

@NgModule({
  declarations: [MapComponent, InfoPanelComponent, LayoutContainerComponent, AnnotationListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    InputTextModule,
    FormsModule,
    ButtonModule,
    SelectButtonModule,
    VirtualScrollerModule
  ],
  providers: [AnnotationEntityService, MapService]
})
export class MapModule {
  constructor(private eds: EntityDefinitionService) {
    eds.registerMetadataMap(entityMetadata);
  }
}
