// async function handleBunningsProduct(prompt: string, chatHistory: string, sessionId: string, isBudgetAvailable: boolean, maxBudget: number, minBudget: number, socket: Socket) {
//     socket.emit('status', {
//         message: "Matey Is Prepareing Product From Bunnings For You..."
//     })
//     const productPrompt = `
// 		Based on User Prompt And Chat Context generate DIY Product that are relavent to search in internet and return to user 
// 		User Prompt: {prompt}
// 		Chat Context: {chatHistory}

// 		Keep in mind:
// 		- The products should be related to DIY and creative projects.
// 		- The products should be easily available online.
// 		- The products should be suitable for a wide range of users, from beginners to experts.
// 		- Data gram format should be valid and parsable to JSON.
// 		- Data gram Example : ["product1","product2","product3"]
// 		- length of array should be 0-4
// 		- Return only the product names in an array (response should contain only an array that can be parsed to JSON):
// 		- No Comment or additional text
// 		- give in one linear plain text response
// 		Array:
// `;
//     const productTemplate = PromptTemplate.fromTemplate(productPrompt);
//     const productLLMChain = productTemplate.pipe(llm).pipe(new StringOutputParser());
//     const runnableChainOfProduct = RunnableSequence.from([productLLMChain, new RunnablePassthrough()]);
//     const products = await runnableChainOfProduct.invoke({ prompt, chatHistory });

//     try {
//         const parsedProductList = JSON.parse(products.replace(/`/g, '').replace('json', '').replace('JSON', '').replace('Array:', '').trim());

//         const searchItems = parsedProductList.map((product: string) => {
//             return {
//                 searchTerm: product,
//                 productLimit: 3,
//                 productPage: 1
//             }
//         });
//         const response = await axios.post(`${process.env.WEB_SCRAPPER_API_ENDPOINT}/api/v1/scrapeBunningsProduct`, {
//             userId: sessionId,
//             searchItems: searchItems,
//             isBudgetSearchOn: isBudgetAvailable,
//             minBudgetValue: minBudget,
//             maxBudgetValue: maxBudget
//         })

//         if (!response.data.success) {
//             return [];
//         }
//         const indexedProducts: any = [];
//         const wholeIndexedProducts: any = [];
//         let index = 1;
//         response.data.data.data.map((category: any) => {
//             category.data.map((product: any) => {
//                 indexedProducts.push({
//                     index: index,
//                     name: product.name,
//                 });
//                 wholeIndexedProducts.push({
//                     index: index,
//                     ...product
//                 });
//                 index++;
//             });
//         });
//         const aiProductPrompt = `Based On User Chat Context and prompt categorize the product given
		
// 		prompt:{prompt}
// 		chatHistory:{chatHistory}
// 		products : {products}

// 		your job is to return the products in categirized format
// 		blueprint of output format:
// 	[
// 	Object(categoryName: string, products: array of object((personalUsage:string,index:number),personalUsage:string,index:number)),	
// 	]
// 	type : 
// 	(categoryName: string,products: (personalUsage:string,index:number)[])[]

// 	Steps:

// Categorize relevant products only.
// Exclude empty categories and any non-useful products.
// For each product, include index (position in list) and a personal_usage field, providing a short usage description based on the chat context.
// Output as a JSON array of product objects, with no extra text or comments. Start directly with the array of objects in plain text.
// 		`;
//         const aiProductTemplate = PromptTemplate.fromTemplate(aiProductPrompt);
//         const aiProductLLMChain = aiProductTemplate.pipe(llm).pipe(new StringOutputParser());
//         const runnableChainOfAiProduct = RunnableSequence.from([aiProductLLMChain, new RunnablePassthrough()]);
//         const aiProducts = await runnableChainOfAiProduct.invoke({
//             prompt,
//             chatHistory,
//             products: JSON.stringify(indexedProducts)
//         });
//         const parsedAiProducts = JSON.parse(aiProducts);

//         const remappedProducts = parsedAiProducts.map((category: any) => {
//             const { categoryName, products } = category;
//             return {
//                 categoryName,
//                 products: products.map((product: any) => {
//                     const originalProduct = wholeIndexedProducts.find((p: any) => p.index === product.index);
//                     return {
//                         ...originalProduct,
//                         image: originalProduct.imageUrl,
//                         rating: originalProduct.reviews.replace(/[()]/g, ''),
//                         personalUsage: product.personalUsage,
//                     };
//                 }),
//             };
//         });

//         socket.emit('bunningsProduct', remappedProducts);

//         return remappedProducts;


//         // // Transform the response data to match expected format
//         // const res = response.data.data.data.map((category: any) => ({
//         // 	categoryName: category.searchTerm,
//         // 	products: category.data.map((product: any) => ({
//         // 		name: product.name,
//         // 		price: product.price,
//         // 		imageUrl: product.imageUrl,
//         // 		link: product.link,
//         // 		rating: product.reviews.replace(/[()]/g, ''), // Remove parentheses from reviews
//         // 		personalUsage: `Perfect for ${category.searchTerm.toLowerCase()} tasks` // Added default personalUsage
//         // 	}))
//         // }));


//         // const 


//         // socket.emit('bunningsProduct', res);

//         // return res;
//     } catch (error: any) {
//         console.error('Error parsing product list:', error.message);
//         socket.emit('error', 'Error occurred while fetching product list.');
//         return [];
//     }
// }
