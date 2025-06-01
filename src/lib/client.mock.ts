// This file contains mock functions for all storefront services.
// You can use this as a template to connect your own ecommerce provider.

import type { Options, RequestResult } from '@hey-api/client-fetch';
import type {
	Collection,
	CreateCustomerData,
	CreateCustomerError,
	CreateCustomerResponse,
	CreateOrderData,
	CreateOrderError,
	CreateOrderResponse,
	GetCollectionByIdData,
	GetCollectionByIdError,
	GetCollectionByIdResponse,
	GetCollectionsData,
	GetCollectionsError,
	GetCollectionsResponse,
	GetOrderByIdData,
	GetOrderByIdError,
	GetOrderByIdResponse,
	GetProductByIdData,
	GetProductByIdError,
	GetProductByIdResponse,
	GetProductsData,
	GetProductsError,
	GetProductsResponse,
	Order,
	Product,
} from './client.types.ts';

export * from './client.types.ts';

export const getProducts = <ThrowOnError extends boolean = false>(
	options?: Options<GetProductsData, ThrowOnError>,
): RequestResult<GetProductsResponse, GetProductsError, ThrowOnError> => {
	let items = Object.values(products);
	if (options?.query?.collectionId) {
		const collectionId = options.query.collectionId;
		items = items.filter((product) => product.collectionIds?.includes(collectionId));
	}
	if (options?.query?.ids) {
		const ids = Array.isArray(options.query.ids) ? options.query.ids : [options.query.ids];
		items = items.filter((product) => ids.includes(product.id));
	}
	if (options?.query?.sort && options?.query?.order) {
		const { sort, order } = options.query;
		if (sort === 'price') {
			items = items.sort((a, b) => {
				return order === 'asc' ? a.price - b.price : b.price - a.price;
			});
		} else if (sort === 'name') {
			items = items.sort((a, b) => {
				return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
			});
		}
	}
	return asResult({ items, next: null });
};

export const getProductById = <ThrowOnError extends boolean = false>(
	options: Options<GetProductByIdData, ThrowOnError>,
): RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError> => {
	const product = products[options.path.id];
	if (!product) {
		const error = asError<GetProductByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>;
	}
	return asResult(product);
};

export const getCollections = <ThrowOnError extends boolean = false>(
	_options?: Options<GetCollectionsData, ThrowOnError>,
): RequestResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError> => {
	return asResult({ items: Object.values(collections), next: null });
};

export const getCollectionById = <ThrowOnError extends boolean = false>(
	options: Options<GetCollectionByIdData, ThrowOnError>,
): RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError> => {
	const collection = collections[options.path.id];
	if (!collection) {
		const error = asError<GetCollectionByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>;
	}
	return asResult({ ...collection, products: [] });
};

export const createCustomer = <ThrowOnError extends boolean = false>(
	options?: Options<CreateCustomerData, ThrowOnError>,
): RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	return asResult({
		...options.body,
		id: options.body.id ?? 'customer-1',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	});
};

const orders: Record<string, Order> = {};

export const createOrder = <ThrowOnError extends boolean = false>(
	options?: Options<CreateOrderData, ThrowOnError>,
): RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	const order: Order = {
		...options.body,
		id: 'dk3fd0sak3d',
		number: 1001,
		lineItems: options.body.lineItems.map((lineItem) => ({
			...lineItem,
			id: crypto.randomUUID(),
			productVariant: getProductVariantFromLineItemInput(lineItem.productVariantId),
		})),
		billingAddress: getAddress(options.body.billingAddress),
		shippingAddress: getAddress(options.body.shippingAddress),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	};
	orders[order.id] = order;
	return asResult(order);
};

export const getOrderById = <ThrowOnError extends boolean = false>(
	options: Options<GetOrderByIdData, ThrowOnError>,
): RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError> => {
	const order = orders[options.path.id];
	if (!order) {
		const error = asError<GetOrderByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>;
	}
	return asResult(order);
};

const collectionDefaults = {
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const collections: Record<string, Collection> = {
	villa: {
		id: 'villa',
		name: 'Villa',
		description: 'Light gauge steel villa luxurious multiple rooms prefab house.Also known as light steel structure housing, its main material is by hot dip galvanized steel strip by cold rolling technology synthesis of light steel keel, after accurate calculation plus auxiliary support and combination, play a reasonable bearing capacity, to replace the traditional housing.',
		slug: 'villa',
		imageUrl: '/assets/shirts.png',
		...collectionDefaults,
	},
	bungalow: {
		id: 'bungalow',
		name: 'Bungalow',
		description: 'Modular ready house tiny drawer house mobile customizable prefab houses.It can settle down in any corner of the world. It can also be shipped  after finished in factory.Not only that, it also explainsWhat is a high-end mobile home.Under the premise of ensuring comfort.Taking health as the most important indicator and comparing the present to the future, we have developed a very livable housing system.',
		slug: 'bungalow',
		imageUrl: '/assets/astro-sticker-pack.png',
		...collectionDefaults,
	},
	bestSellers: {
		id: 'bestSellers',
		name: 'Best Sellers',
		description: "You'll love these.",
		slug: 'best-sellers',
		imageUrl: '/assets/astro-houston-sticker.png',
		...collectionDefaults,
	},
};

const defaultVariant = {
	id: 'default',
	name: 'Default',
	stock: 20,
	options: {},
};

const apparelVariants = ['1BDR', '2BDR', '3BDR', '5BDR'].map((size, index) => ({
	id: size,
	name: size,
	stock: index * 10,
	options: {
		Size: size,
	},
}));

const productDefaults = {
	description: '',
	images: [],
	variants: [defaultVariant],
	discount: 0,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const products: Record<string, Product> = {
	'astro-icon-zip-up-hoodie': {
		...productDefaults,
		id: 'astro-icon-zip-up-hoodie',
		name: 'Light gauge steel villa luxurious',
		slug: 'astro-icon-zip-up-hoodie',
		tagline:
			'No need to compress this .zip. The Zip Up Hoodie is a comfortable fit and fabric for all sizes.',
		price: 6500,
		imageUrl: '/assets/astro-zip-up-hoodie.png',
		collectionIds: ['villa', 'bestSellers'],
		variants: apparelVariants,
	},
	'astro-logo-curve-bill-snapback-cap': {
		...productDefaults,
		id: 'astro-logo-curve-bill-snapback-cap',
		name: 'Light gauge steel villa luxurious',
		slug: 'astro-logo-curve-bill-snapback-cap',
		tagline: 'The best hat for any occasion, no cap.',
		price: 5500,
		imageUrl: '/assets/astro-cap.png',
		collectionIds: ['villa'],
	},
	'astro-sticker-sheet': {
		...productDefaults,
		id: 'astro-sticker-sheet',
		name: 'Three BDR Bungalow',
		slug: 'astro-sticker-sheet',
		tagline: "You probably want this for the fail whale sticker, don't you?",
		price: 5500,
		imageUrl: '/assets/astro-sticker-pack.png',
		collectionIds: ['bungalow'],
	},
	'sticker-pack': {
		...productDefaults,
		id: 'sticker-pack',
		name: 'Bungalow',
		slug: 'sticker-pack',
		tagline: 'Jam packed with the most popular stickers.',
		price: 2000,
		imageUrl: '/assets/astro-sticker-pack.png',
		collectionIds: ['bungalow', 'bestSellers'],
	},
	'astro-icon-unisex-shirt': {
		...productDefaults,
		id: 'astro-icon-unisex-shirt',
		name: 'Light gauge steel villa',
		slug: 'astro-icon-unisex-shirt',
		tagline: 'A comfy Tee with the classic Astro logo.',
		price: 5775,
		imageUrl: '/assets/astro-unisex-tshirt.png',
		collectionIds: ['villa'],
		variants: apparelVariants,
	},
	'astro-icon-gradient-sticker': {
		...productDefaults,
		id: 'astro-icon-gradient-sticker',
		name: 'Bungalow',
		slug: 'astro-icon-gradient-sticker',
		tagline: "There gradi-ain't a better sticker than the classic Astro logo.",
		price: 200,
		imageUrl: '/assets/astro-icon-sticker.png',
		collectionIds: ['bungalow', 'bestSellers'],
	},
	'astro-logo-beanie': {
		...productDefaults,
		id: 'astro-logo-beanie',
		name: 'School Building',
		slug: 'astro-logo-beanie',
		tagline: "There's never Bean a better hat for the winter season.",
		price: 1800,
		imageUrl: '/assets/astro-beanie.png',
		collectionIds: ['villa', 'bestSellers'],
	},
	'lighthouse-100-sticker': {
		...productDefaults,
		id: 'lighthouse-100-sticker',
		name: 'Lighthouse 100 Sticker',
		slug: 'lighthouse-100-sticker',
		tagline: 'Bad performance? Not in my (light) house.',
		price: 500,
		imageUrl: '/assets/astro-lighthouse-sticker.png',
		collectionIds: ['bungalow'],
	},
	'houston-sticker': {
		...productDefaults,
		id: 'houston-sticker',
		name: 'Houston Sticker',
		slug: 'houston-sticker',
		tagline: 'You can fit a Hous-ton of these on any laptop lid.',
		price: 250,
		discount: 100,
		imageUrl: '/assets/astro-houston-sticker.png',
		collectionIds: ['bungalow', 'bestSellers'],
	},
};

function asResult<T>(data: T) {
	return Promise.resolve({
		data,
		error: undefined,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function asError<T>(error: T) {
	return Promise.resolve({
		data: undefined,
		error,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function getAddress(address: Required<CreateOrderData>['body']['shippingAddress']) {
	return {
		line1: address?.line1 ?? '',
		line2: address?.line2 ?? '',
		city: address?.city ?? '',
		country: address?.country ?? '',
		province: address?.province ?? '',
		postal: address?.postal ?? '',
		phone: address?.phone ?? null,
		company: address?.company ?? null,
		firstName: address?.firstName ?? null,
		lastName: address?.lastName ?? null,
	};
}

function getProductVariantFromLineItemInput(
	variantId: string,
): NonNullable<Order['lineItems']>[number]['productVariant'] {
	for (const product of Object.values(products)) {
		for (const variant of product.variants) {
			if (variant.id === variantId) {
				return { ...variant, product };
			}
		}
	}
	throw new Error(`Product variant ${variantId} not found`);
}
