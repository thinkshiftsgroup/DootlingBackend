export interface ProductOptionInput {
  optionType: string;
  values: string[];
}

export interface ProductPricingInput {
  currencyCode: string;
  sellingPrice: number;
  originalPrice?: number;
}

export interface ProductDescriptionDetailInput {
  title: string;
  description: string;
}

export interface ProductCreationData {
  name: string;
  productImages: string[];
  shortDescription: string;
  stockQuantity: number;
  type: "REGULAR" | "VARIANT";

  longDescription?: string;
  customProductUrl?: string;
  seoDescription?: string;
  checkoutButtonCta?: string;
  hideFromHomepage?: boolean;
  unit?: string;
  barcode?: string;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  isPreOrder?: boolean;
  preOrderReleaseDate?: Date;
  showStrikedOutOriginalPrice?: boolean;
  embedVideoPath?: string;
  discoveryCategories?: string[];
  commissionPercentage?: number;
  autoRedirectAfterPurchase?: boolean;
  redirectUrl?: string;

  pricings: ProductPricingInput[];
  descriptionDetails: ProductDescriptionDetailInput[];
  options: ProductOptionInput[];

  categories: number[];
  upsellProductIds: number[];
  crossSellProductIds: number[];
}

export interface ProductUpdateData {
  name?: string;
  productImages?: string[];
  shortDescription?: string;
  longDescription?: string;
  stockQuantity?: number;
  type?: "REGULAR" | "VARIANT";

  customProductUrl?: string;
  seoDescription?: string;
  checkoutButtonCta?: string;
  hideFromHomepage?: boolean;
  unit?: string;
  barcode?: string;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  isPreOrder?: boolean;
  preOrderReleaseDate?: Date;
  showStrikedOutOriginalPrice?: boolean;
  embedVideoPath?: string;
  discoveryCategories?: string[];
  commissionPercentage?: number;
  autoRedirectAfterPurchase?: boolean;
  redirectUrl?: string;

  pricings?: ProductPricingInput[];
  descriptionDetails?: ProductDescriptionDetailInput[];
  options?: ProductOptionInput[];

  categories?: number[];
  upsellProductIds?: number[];
  crossSellProductIds?: number[];
}

export interface CategoryCreationData {
  name: string;
  description?: string;
  image?: string;
}

export interface CategoryUpdateData {
  name?: string;
  description?: string;
  image?: string;
}
