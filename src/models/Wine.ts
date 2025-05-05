export interface Wine {
  id: string;
  name: string;
  producer: string;
  vintage: number;
  varietal: string;
  region: string;
  barcode: string;
  notes?: string;
  rating?: number;
  dateAdded: Date;
  imageUrl?: string;
}