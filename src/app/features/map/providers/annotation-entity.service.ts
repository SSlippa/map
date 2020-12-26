import { Injectable } from '@angular/core';

import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { IAnnotation } from './map.service';


@Injectable()
export class AnnotationEntityService
  extends EntityCollectionServiceBase<IAnnotation> {

  constructor(
    serviceElementsFactory:
      EntityCollectionServiceElementsFactory) {

    super('Annotation', serviceElementsFactory);

  }

}

