export enum AnnotationType {
  Point = 'Point',
  LineString = 'LineString',
  Polygon = 'Polygon'
}

export interface MapboxOutput {
  attribution: string;
  features: Feature[];
  query: [];
}

export interface Feature {
  place_name: string;
}

export interface IDrawCreateEvent {
  features: {
    geometry: {
      coordinates: any;
      type: string;
    },
    properties: {},
    type: string,
    id: string
  }[];
  target: {};
  type: string;
}

export interface IAnnotation {
  id: string;
  coordinates: [];
  name: string;
  type: AnnotationType;
  isActive: boolean;
}
