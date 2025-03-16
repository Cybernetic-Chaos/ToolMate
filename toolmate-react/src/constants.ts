// render expression

export const pricing = [
  {
    tabName: "month",
    list: [
      {
        price: "0$/Month",
        priceInt: 0,
        title: "Toolmate Basic",
        tabName: "month",
        planValue: "basic",
        color: ["#EEEEEF", "#E0E0E0"], // Light gray shades
        isActivePlan: true,
        icons: "/assets/icons/wrench.svg",
        featureList: [
          {
            isTicked: true,
            title: "Basic tool suggestions:",
            desc: "Limited recommendations from Matey.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Safety reminders",
            desc: "Essential safety tips for your projects.",
            isLineBelow: false,
          },
        ],
      },
      {
        set priceSetter(priceDetails: { price: number }) {
          this.price = `${priceDetails.price}$ / Month`;
          this.priceInt = priceDetails.price;
        },
        set productIdSetter(productId: string) {
          this.productId = productId;
        },
        productId: "",
        price: "",
        priceInt: 0,
        planValue: "essential",
        title: "Toolmate Essential",
        tabName: "months",
        color: ["#FFF2AE", "#FFD700"],
        isActivePlan: false,
        icons: "/assets/icons/gear.svg",
        featureList: [
          {
            isTicked: true,
            title: "Personalized picks",
            desc: "Tailored recommendations based on your project.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Tool rentals",
            desc: "Rental suggestions when needed.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Community access",
            desc: "Engage with fellow DIYers for tips and advice.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Basic AI support",
            desc: "Matey helps with straightforward tool advice.",
            isLineBelow: false,
          },
        ],
      },
      {
        set priceSetter(priceDetails: { price: number }) {
          this.price = `${priceDetails.price}$ / Month`;
          this.priceInt = priceDetails.price;
        },
        set productIdSetter(productId: string) {
          this.productId = productId;
        },
        productId: "",
        price: "",
        priceInt: 0,
        title: "Toolmate Pro",
        tabName: "year",
        planValue: "pro",
        icons: "/assets/icons/toolbox.svg",
        color: ["#FBDF29", "#FFD709"],
        isActivePlan: false,
        featureList: [
          {
            isTicked: true,
            title: "Project memory",
            desc: "Matey remembers your ongoing projects and tools.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Advanced tool comparisons",
            desc: "In-depth insights for complex projects.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Real-time updates",
            desc: "Matey tracks progress and provides timely tips.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Project budgeting",
            desc: "Smart tools for efficient project planning.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Expert advice",
            desc: "Get detailed recommendations for advanced projects.",
            isLineBelow: false,
          },
        ],
      },
    ],
  },
  {
    tabName: "months",
    list: [
      {
        price: "0$/ 6 Month",
        priceInt: 0,
        title: "Toolmate Basic",
        tabName: "month",
        planValue: "basic",
        color: ["#EEEEEF", "#E0E0E0"], // Light gray shades
        isActivePlan: true,
        icons: "/assets/icons/wrench.svg",
        featureList: [
          {
            isTicked: true,
            title: "Basic tool suggestions:",
            desc: "Limited recommendations from Matey.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Safety reminders",
            desc: "Essential safety tips for your projects.",
            isLineBelow: false,
          },
        ],
      },
      {
        set priceSetter(priceDetails: { price: number, discount: number }) {
          if (priceDetails.discount > 0) {
            this.price = `${priceDetails.price}$ / 6 Month (${priceDetails.discount}% off)`;
          } else {
            this.price = `${priceDetails.price}$ / 6 Month`;
          }
          this.priceInt = priceDetails.price;
        },
        set productIdSetter(productId: string) {
          this.productId = productId;
        },
        productId: "",
        price: " / 6 Months (15% off)",
        priceInt: 0,
        title: "Toolmate Essential",
        color: ["#FFF2AE", "#FFD700"],
        planValue: "essential",
        icons: "/assets/icons/gear.svg",
        isActivePlan: false,
        featureList: [
          {
            isTicked: true,
            title: "Personalized picks",
            desc: "Tailored recommendations based on your project.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Tool rentals",
            desc: "Rental suggestions when needed.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Community access",
            desc: "Engage with fellow DIYers for tips and advice.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Basic AI support",
            desc: "Matey helps with straightforward tool advice.",
            isLineBelow: false,
          },
        ],
      },
      {
        set priceSetter(priceDetails: { price: number, discount: number }) {
          if (priceDetails.discount > 0) {
            this.price = `${priceDetails.price}$ / 6 Month (${priceDetails.discount}% off)`;
          } else {
            this.price = `${priceDetails.price}$ / 6 Month`;
          }
          this.priceInt = priceDetails.price;
        },
        set productIdSetter(productId: string) {
          this.productId = productId;
        },
        productId: "",
        price: "$102 / 6 Months (15% off)",
        priceInt: 102,
        title: "Toolmate Pro",
        color: ["#FBDF29", "#FF7C36"],
        planValue: "pro",
        icons: "/assets/icons/toolbox.svg",
        isActivePlan: false,
        featureList: [
          {
            isTicked: true,
            title: "Project memory",
            desc: "Matey remembers your ongoing projects and tools.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Advanced tool comparisons",
            desc: "In-depth insights for complex projects.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Real-time updates",
            desc: "Matey tracks progress and provides timely tips.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Project budgeting",
            desc: "Smart tools for efficient project planning.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Expert advice",
            desc: "Get detailed recommendations for advanced projects.",
            isLineBelow: false,
          },
        ],
      },
    ],
  },
  {
    tabName: "year",
    list: [
      {
        price: "0$/Year",
        priceInt: 0,
        title: "Toolmate Basic",
        tabName: "month",
        planValue: "basic",
        isActivePlan: true,
        color: ["#EEEEEF", "#E0E0E0"], // Light gray shades
        icons: "/assets/icons/wrench.svg",
        featureList: [
          {
            isTicked: true,
            title: "Basic tool suggestions:",
            desc: "Limited recommendations from Matey.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Safety reminders",
            desc: "Essential safety tips for your projects.",
            isLineBelow: false,
          },
        ],
      },
      {
        set priceSetter(priceDetails: { price: number, discount: number }) {
          if (priceDetails.discount > 0) {
            this.price = `${priceDetails.price}$ / Year (${priceDetails.discount}% off)`;
          } else {
            this.price = `${priceDetails.price}$ / Year`;
          }
          this.priceInt = priceDetails.price;
        },
        set productIdSetter(productId: string) {
          this.productId = productId;
        },
        productId: "",
        price: "",
        priceInt: 0,
        title: "Toolmate Essential",
        planValue: "essential",
        color: ["#FFF2AE", "#FFD700"],
        icons: "/assets/icons/gear.svg",
        isActivePlan: false,
        featureList: [
          {
            isTicked: true,
            title: "Personalized picks",
            desc: "Tailored recommendations based on your project.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Tool rentals",
            desc: "Rental suggestions when needed.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Community access",
            desc: "Engage with fellow DIYers for tips and advice.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Basic AI support",
            desc: "Matey helps with straightforward tool advice.",
            isLineBelow: false,
          },
        ],
      },
      {
        set priceSetter(priceDetails: { price: number, discount: number }) {
          if (priceDetails.discount > 0) {
            this.price = `${priceDetails.price}$ / Year (${priceDetails.discount}% off)`;
          } else {
            this.price = `${priceDetails.price}$ / Year`;
          }
          this.priceInt = priceDetails.price;
        },
        set productIdSetter(productId: string) {
          this.productId = productId;
        },
        productId: "",
        price: "",
        priceInt: 0,
        title: "Toolmate Pro",
        color: ["#FBDF29", "#FF7C36"],
        isActivePlan: false,
        planValue: "pro",
        icons: "/assets/icons/toolbox.svg",
        featureList: [
          {
            isTicked: true,
            title: "Project memory",
            desc: "Matey remembers your ongoing projects and tools.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Advanced tool comparisons",
            desc: "In-depth insights for complex projects.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Real-time updates",
            desc: "Matey tracks progress and provides timely tips.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Project budgeting",
            desc: "Smart tools for efficient project planning.",
            isLineBelow: true,
          },
          {
            isTicked: true,
            title: "Expert advice",
            desc: "Get detailed recommendations for advanced projects.",
            isLineBelow: false,
          },
        ],
      },
    ],
  },
];



export const productSuggestionsTabs = [
  {
      img: "/assets/icons/new-placeholder.svg",
      name: "bunnings",
      tooltip: "Bunnings Product Suggestion",
  },
  {
      img: "/assets/icons/ai-placeholder.svg",
      name: "ai",
      tooltip: "Product Suggestion By Matey",
  },
  {
      img: "/assets/icons/vendor-placeholder.svg",
      name: "vendor",
      tooltip: "Vendor Product Suggestion",
  }
]