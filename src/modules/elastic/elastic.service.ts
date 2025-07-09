import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticService {
	private readonly client: Client;

	constructor() {
		this.client = new Client({
			node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
		});
	}

	getClient() {
		return this.client;
	}
}
