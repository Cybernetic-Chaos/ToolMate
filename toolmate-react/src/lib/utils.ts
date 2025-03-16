import { IBunningProduct, IBunningsFilter, VendorProduct } from "@/types/types";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getImageUrl(imageParams: string) {
  return `https://toolmate-images-1.s3.ap-southeast-2.amazonaws.com/${imageParams}`;
}

// calulate discounted price
export function calculateDiscountedPrice(price: number, discount: number) {
  return (price - price * discount / 100).toFixed(2);
}

// calculate price user saved
export function calculateImpact(price: number, discountPercent: number) {
  const discountedPrice = parseFloat(calculateDiscountedPrice(price, discountPercent));
  return (price - discountedPrice).toFixed(2);
}

export function extractBAToken(url: string) {
  try {
    // Parse the URL using the URL constructor
    const parsedUrl = new URL(url);

    // Get the value of the 'ba_token' parameter
    const baToken = parsedUrl.searchParams.get('ba_token');

    // Return the BA token or null if not present
    return baToken || null;
  } catch (error: any) {
    console.error('Invalid URL:', error.message);
    return null;
  }
}





export function getBunningsFilterData(bunningData: IBunningProduct[], exisitingFilter?: IBunningsFilter) {

  // brands
  const brands = bunningData.map((product) => product.brand);
  const uniqueBrands = Array.from(new Set(brands));

  // pricing
  const [min, max] = bunningData.reduce((acc, product) => {
    const price = product.price.unitPrice;
    return [Math.min(acc[0], price), Math.max(acc[1], price)];
  }, [Infinity, -Infinity]);

  // best seller
  let bestSeller = exisitingFilter?.bestSeller ?? false;
  for (const product of bunningData) {
    if (product.bestSeller) {
      bestSeller = true;
      break;
    }
  }

  // is new arrival
  let newArrival = exisitingFilter?.newArrival ?? false;
  for (const product of bunningData) {
    if (product.newArrival) {
      newArrival = true;
      break;
    }
  }

  // leading brand
  let isTopBrand = exisitingFilter?.isTopBrand ?? false;
  for (const product of bunningData) {
    if (product.leadingBrand) {
      isTopBrand = true;
      break;
    }
  }

  return {
    brands: exisitingFilter?.brands ? Array.from(new Set([...exisitingFilter.brands, ...uniqueBrands])) : uniqueBrands,
    price: exisitingFilter?.price ? [Math.min(exisitingFilter.price[0], min), Math.max(exisitingFilter.price[1], max)] as [number, number] : [min, max] as [number, number],
    bestSeller,
    newArrival,
    isTopBrand
  }
}


export function getVendorFilterData(vendorData: VendorProduct[]) {

  // pricing 
  const [min, max] = vendorData.reduce((acc, product) => {
    const price = Number(product.price);
    return [Math.min(acc[0], price), Math.max(acc[1], price)];
  }, [Infinity, -Infinity]);

}


// export function getAiFilterData(aiData) {

// }
