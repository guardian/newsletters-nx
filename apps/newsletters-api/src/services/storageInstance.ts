import { InMemoryDraftStorage } from './storage/InMemoryDraftStorage';

const storageInstance = new InMemoryDraftStorage([
	{ listId: 7000, name: 'Test draft newsletter' },
	{ listId: 7001, name: 'Other Test draft newsletter', theme: 'news' },
]);

export { storageInstance };
