import { IBunningProduct } from '@/types/types';
import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface Breakpoint {
  value: number;
  label: string;
  tooltip: string;
}

export interface ProductSuggestionItem {
  image: string;
  title: string;
  description: string;
  price: number;
}

export interface ProductGroup {
  categoryName: string;
  products: any[];
}

// for testing
const tempBreakPoint = [
  {
    value: 50,
    label: "Budget-Friendly",
    tooltip: "Budget-Friendly products may include basic wooden materials, simple horse-themed decorations, and standard tools for assembly. Recommended brands: Generic wood suppliers, local craft stores."
  },
  {
    value: 100,
    label: "Affordable",
    tooltip: "Affordable options offer sturdier wooden materials, intricate horse-themed embellishments, and beginner-friendly instructions. Recommended brands: Home improvement stores like Home Depot or Lowe's, craft kits from Hobby Lobby."
  },
  {
    value: 150,
    label: "Mid-Range",
    tooltip: "Mid-Range selection provides high-quality hardwood materials, detailed horse-inspired designs, and step-by-step guides for intricate structures. Recommended brands: Woodcraft retailers like Rockler, premium craft kits from Michaels."
  },
  {
    value: 200,
    label: "Quality",
    tooltip: "Quality products offer premium hardwood options, precise and unique horse-themed accents, and expert-level instructions for a sophisticated horse throne design. Recommended brands: Specialty woodworking suppliers, premium craft brands like Jo-Ann Fabrics."
  },
  {
    value: 250,
    label: "Luxury",
    tooltip: "Luxury choices include exotic wood selections, bespoke horse-themed adornments, and professional-grade instructions for an exquisite and regal horse throne creation. Recommended brands: Artisan woodworking studios, custom craft suppliers offering personalized design services."
  },
  {
    value: 300,
    label: "Ultimate",
    tooltip: "Ultimate options provide top-tier materials like rare woods, custom-made horse-themed elements, and detailed blueprints for an unparalleled and majestic horse throne masterpiece. Recommended brands: Exclusive woodworking artisans, bespoke craft ateliers providing one-of-a-kind creations."
  }
]

interface RightSidebarContextProps {
  sliderValue: number;
  isBudgetOn: boolean;
  itemNumberBunningsProductCache: Map<number, IBunningProduct>;
  breakpoints: Breakpoint[];
  vendorProduct: ProductGroup[];
  bunningProduct: ProductGroup[];
  aiProduct: ProductGroup[];
  notification: number;
  totalProductSuggestions: number;
  isSliderBreakPointEmpty: boolean;
  isBudgetChangable: boolean;
  setIsBudgetChangable: (value: boolean) => void;
  setSliderValue: (value: number) => void;
  setIsBudgetOn: (value: boolean) => void;
  setBreakpoints: (breakpoints: Breakpoint[]) => void;
  massAddVendor: (products: ProductGroup[]) => void;
  massAddAi: (products: ProductGroup[]) => void;
  massAddBunnings: (products: ProductGroup[]) => void;
  appendVendor: (products: ProductGroup[]) => void;
  appendAi: (products: ProductGroup[]) => void;
  appendBunnings: (products: ProductGroup[]) => void;
  notificationRemove: () => void;
  clearAllTool: () => void;
  setItemNumberToBunnings: (itemNumber: number, data: IBunningProduct) => void;
  getItemFromBunningsCache: (itemNumber: number) => IBunningProduct | undefined;
}

const INITIAL_RIGHT_SIDEBAR_CONTEXT: RightSidebarContextProps = {
  itemNumberBunningsProductCache: new Map(),
  sliderValue: Infinity,
  isBudgetOn: false,
  isBudgetChangable: true,
  breakpoints: [],
  vendorProduct: [],
  bunningProduct: [],
  aiProduct: [],
  notification: 0,
  totalProductSuggestions: 0,
  isSliderBreakPointEmpty: false,
  setSliderValue: () => { },
  setIsBudgetChangable: () => { },
  setIsBudgetOn: () => { },
  setBreakpoints: () => { },
  massAddVendor: () => { },
  massAddAi: () => { },
  massAddBunnings: () => { },
  appendVendor: () => { },
  appendAi: () => { },
  setItemNumberToBunnings: () => { },
  appendBunnings: () => { },
  notificationRemove: () => { },
  clearAllTool: () => { },
  getItemFromBunningsCache: () => undefined
};

export const RightSidebarContext = createContext<RightSidebarContextProps>(INITIAL_RIGHT_SIDEBAR_CONTEXT);

export const RightSidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sliderValue, setSliderValue] = useState<number>(INITIAL_RIGHT_SIDEBAR_CONTEXT.sliderValue);
  const [isBudgetOn, setIsBudgetOn] = useState<boolean>(INITIAL_RIGHT_SIDEBAR_CONTEXT.isBudgetOn);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [vendorProduct, setVendorProduct] = useState<ProductGroup[]>([]);
  const [bunningProduct, setBunningProduct] = useState<ProductGroup[]>([]);
  const [aiProduct, setAiProduct] = useState<ProductGroup[]>([]);
  const [notification, setNotification] = useState<number>(0);
  const [totalProductSuggestions, setTotalProductSuggestions] = useState<number>(0);
  const [isBudgetChangable, setIsBudgetChangable] = useState<boolean>(true);
  const [itemNumberBunningsProductCache, setItemNumberBunningsProductCache] = useState<Map<number, IBunningProduct>>(new Map());

  // Calculate the total number of product suggestions
  const calculateTotalProductSuggestions = () => {
    console.log('calculateTotalProductSuggestions', vendorProduct, bunningProduct, aiProduct);
    const total =
      vendorProduct.reduce((acc, group) => acc + (group.products.length || 0), 0) +
      bunningProduct.reduce((acc, group) => acc + (group.products.length || 0), 0) +
      aiProduct.reduce((acc, group) => acc + (group.products.length || 0), 0);
    setTotalProductSuggestions(total);
  };

  useEffect(() => {
    console.log('vendorProduct', vendorProduct, bunningProduct, aiProduct);
  }, [vendorProduct, bunningProduct, aiProduct])


  // Functions to mass add products
  const massAddVendor = (products: ProductGroup[]) => {
    setVendorProduct(products);
  };

  const massAddAi = (products: ProductGroup[]) => {
    setAiProduct(products);
  };

  const massAddBunnings = (products: ProductGroup[]) => {
    setBunningProduct(products);
  };

  // Functions to append products
  const appendVendor = (products: ProductGroup[]) => {
    setVendorProduct((prev) => [...prev, ...products]);
    setNotification((prev) => prev + products.length);
    calculateTotalProductSuggestions();
  };

  const appendAi = (products: ProductGroup[]) => {
    setAiProduct((prev) => [...prev, ...products]);
    setNotification((prev) => prev + products.length);
    calculateTotalProductSuggestions();

  };

  const appendBunnings = (products: ProductGroup[]) => {
    setBunningProduct((prev) => [...prev, ...products]);
    setNotification((prev) => prev + products.length);
    calculateTotalProductSuggestions();

  };

  // Function to reset notification count
  const notificationRemove = () => {
    setNotification(0);
  };

  useEffect(() => {
    calculateTotalProductSuggestions();
  }, [vendorProduct, bunningProduct, aiProduct]);

  function clearAllTool() {
    setSliderValue(INITIAL_RIGHT_SIDEBAR_CONTEXT.sliderValue);
    setIsBudgetOn(INITIAL_RIGHT_SIDEBAR_CONTEXT.isBudgetOn);
    setBreakpoints(INITIAL_RIGHT_SIDEBAR_CONTEXT.breakpoints);
    setVendorProduct([]);
    setBunningProduct([]);
    setAiProduct([]);
    setNotification(INITIAL_RIGHT_SIDEBAR_CONTEXT.notification);
    setTotalProductSuggestions(INITIAL_RIGHT_SIDEBAR_CONTEXT.totalProductSuggestions);
  }

  function setItemNumberToBunnings(itemNumber: number, data: IBunningProduct) {
    setItemNumberBunningsProductCache((prev) => new Map(prev).set(itemNumber, data));
  }

  function getItemFromBunningsCache(itemNumber: number): IBunningProduct | undefined {
    return itemNumberBunningsProductCache.get(itemNumber);
  }


  return (
    <RightSidebarContext.Provider
      value={{
        itemNumberBunningsProductCache,
        sliderValue,
        setItemNumberToBunnings,
        getItemFromBunningsCache,
        isBudgetOn,
        isBudgetChangable,
        breakpoints,
        vendorProduct,
        bunningProduct,
        aiProduct,
        notification,
        totalProductSuggestions,
        isSliderBreakPointEmpty: breakpoints.length === 0,
        setIsBudgetChangable,
        setSliderValue,
        setIsBudgetOn,
        setBreakpoints,
        massAddVendor,
        massAddAi,
        massAddBunnings,
        appendVendor,
        appendAi,
        appendBunnings,
        notificationRemove,
        clearAllTool
      }}
    >
      {children}
    </RightSidebarContext.Provider>
  );
};
