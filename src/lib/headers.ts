import { ONE_DAY, ONE_HOUR } from '../config.ts';

const DISABLE_CDN_CACHE = import.meta.env.DISABLE_CDN_CACHE?.toLowerCase() === 'true';

export type CacheTagOptions = {
	productIds?: string[];
	collectionIds?: string[];
	collectionsMetadataWasModified?: boolean;
};

export function applyCacheHeaders(headers: Headers, options?: { cacheTags?: CacheTagOptions }) {
	const cacheHeaders: Record<string, string> = {
		'cache-control': 'public,max-age=0,must-revalidate',
	};
	if (!DISABLE_CDN_CACHE) {
		// 1 day cache, allow up to 5 minutes until next request to revalidate.
		cacheHeaders['cdn-cache-control'] =
			`public,durable,s-maxage=${ONE_DAY},stale-while-revalidate=${ONE_HOUR}`;

		if (options?.cacheTags) {
			const tagsHeaderValue = CacheTags.toHeaderValue(options.cacheTags);
			if (tagsHeaderValue) {
				cacheHeaders['cache-tag'] = tagsHeaderValue;
			}
		}
	}

	for (const [key, value] of Object.entries(cacheHeaders)) {
		headers.append(key, value);
	}
}

export const CacheTags = {
	forProduct(productId: string) {
		return `pid_${productId}`;
	},
	forCollection(collectionId: string) {
		return `cid_${collectionId}`;
	},
	forCollectionsMetadata() {
		return 'collections_metadata';
	},
	toValues(options: CacheTagOptions): string[] {
		let values: string[] = [];
		if (options.productIds?.length) {
			values = values.concat(options.productIds.map((id) => this.forProduct(id)));
		}
		if (options.collectionIds?.length) {
			values = values.concat(options.collectionIds.map((id) => this.forCollection(id)));
		}
		if (options.collectionsMetadataWasModified) {
			values.push(this.forCollectionsMetadata());
		}
		return values;
	},
	toHeaderValue(options: CacheTagOptions): string | null {
		const values = this.toValues(options);
		return values.length > 0 ? values.join(',') : null;
	},
};
