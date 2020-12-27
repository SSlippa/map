import { Injectable } from '@angular/core';

import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { IAnnotation } from '../models';

@Injectable()
export class AnnotationEntityService
  extends EntityCollectionServiceBase<IAnnotation> {

  constructor(
    serviceElementsFactory:
      EntityCollectionServiceElementsFactory) {

    super('Annotation', serviceElementsFactory);

  }

}

