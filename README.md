<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
  <a href="https://www.elastic.co/">
    <img src="https://cdn.worldvectorlogo.com/logos/elasticsearch.svg" alt="Elasticsearch Logo" width="125" height="125">
  </a>
  <a href="https://opensearch.org/">
    <img src="https://opensearch.org/assets/brand/PNG/Logo/OpenSearch_Logo/Horizontal/OpenSearch_Horizontal_Logo.png" alt="OpenSearch Logo" width="200" height="80">
  </a>
</p>

# NestJS + Elasticsearch/OpenSearch Integration

[![npm version](https://badge.fury.io/js/%40alti-js%2Fnestjs-elasticsearch.svg)](https://badge.fury.io/js/%40alti-js%2Fnestjs-elasticsearch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive NestJS integration library for **Elasticsearch** and **OpenSearch** with advanced features including multi-region support, unified API, and enterprise-grade capabilities.

## 🚀 Features

### Core Features
- **🔄 Dual Engine Support**: Seamlessly works with both Elasticsearch and OpenSearch
- **🌍 Multi-Region Support**: Connect to multiple OpenSearch clusters across different regions
- **🔗 Unified API**: Same interface for both search engines - no code changes needed
- **📝 Type Safety**: Full TypeScript support with comprehensive type definitions
- **⚡ Performance**: Optimized for high-performance search operations
- **🛡️ Enterprise Ready**: Production-grade error handling and logging

### Advanced Features
- **📊 Cross-Region Operations**: Search and bulk operations across multiple regions
- **🎯 Request-Based Routing**: Automatic region detection from request objects
- **📈 Enhanced Index Management**: Complete CRUD operations for indices and documents
- **🔄 Backward Compatibility**: Existing Elasticsearch configurations continue to work
- **�� Comprehensive Testing**: Full test coverage with Jest
- **📚 Rich Documentation**: Detailed examples and API documentation

## 📦 Installation

```bash
npm install @alti-js/nestjs-elasticsearch
```

## 🏗️ Quick Start

### Basic Setup

Import and configure the `ElasticsearchModule` in your NestJS application:

```typescript
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@alti-js/nestjs-elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.forRoot({
      index: "my-app-index",
      node: "http://localhost:9200",
      port: "9200",
      auth: {
        username: "elastic",
        password: "changeme",
      },
      engine: "elasticsearch", // or "opensearch"
      models: [PostIndex],
    }),
  ],
})
export class AppModule {}
```

## ⚙️ Configuration

### Single Region Configuration

#### Elasticsearch Configuration

```typescript
import { ElasticsearchModule } from '@alti-js/nestjs-elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.forRoot({
      index: "test-index",
      node: "http://localhost",
      port: "9200",
      auth: {
        username: "elastic",
        password: "changeme",
      },
      engine: "elasticsearch", // Optional, defaults to elasticsearch
      models: [PostIndex],
    }),
  ],
})
export class AppModule {}
```

#### OpenSearch Configuration

```typescript
import { ElasticsearchModule } from '@alti-js/nestjs-elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.forRoot({
      index: "test-index",
      node: "http://localhost",
      port: "9200",
      auth: {
        username: "admin",
        password: "admin",
      },
      engine: "opensearch", // Required for OpenSearch
      models: [PostIndex],
    }),
  ],
})
export class AppModule {}
```

### Multi-Region Configuration

For multi-region OpenSearch support, use the `MultiRegionElasticsearchModule`:

```typescript
import { Module } from '@nestjs/common';
import { MultiRegionElasticsearchModule } from '@alti-js/nestjs-elasticsearch';

const multiRegionConfig = {
  engine: 'opensearch' as const,
  defaultRegion: 'singapore' as const,
  indexPrefix: 'myapp',
  regions: {
    singapore: {
      node: 'https://opensearch-sg.example.com',
      port: '9200',
      auth: { username: 'admin', password: 'password' }
    },
    indonesia: {
      node: 'https://opensearch-id.example.com',
      port: '9200',
      auth: { username: 'admin', password: 'password' }
    },
    australia: {
      node: 'https://opensearch-au.example.com',
      port: '9200',
      auth: { username: 'admin', password: 'password' }
    },
    thailand: {
      node: 'https://opensearch-th.example.com',
      port: '9200',
      auth: { username: 'admin', password: 'password' }
    }
  }
};

@Module({
  imports: [
    MultiRegionElasticsearchModule.forRoot(multiRegionConfig),
  ],
})
export class AppModule {}
```

### Configuration Options

| Config | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `index` | string | Search index name | Yes | - |
| `node` | string | Search engine node URL | Yes | - |
| `port` | string | Search engine port | Yes | - |
| `auth` | object | Authentication credentials | Yes | - |
| `engine` | 'elasticsearch' \| 'opensearch' | Search engine type | No | 'elasticsearch' |
| `models` | array | Search models for auto-indexing | No | [] |
| `defaultRegion` | Region | Default region for multi-region setup | No | 'singapore' |
| `indexPrefix` | string | Prefix for index names | No | '' |

## 📋 Models

Define your search models using decorators:

```typescript
import {
  ElasticColumn,
  ElasticIndex,
} from '@alti-js/nestjs-elasticsearch';
import {
  BaseDocument,
  IDoc,
} from '@alti-js/nestjs-elasticsearch';

export interface IPostIndex extends IDoc {
  id: string;
  title: string;
  author: string;
  content: string;
  hashtags: string;
  createdAt: Date;
  region?: string;
}

@ElasticIndex('post')
export class PostIndex extends BaseDocument<IPostIndex> implements IPostIndex {
  id: string;

  @ElasticColumn({ type: 'text', index: true })
  title: string;

  @ElasticColumn({ type: 'text', index: true })
  content: string;

  @ElasticColumn({ type: 'text', index: true })
  author: string;

  @ElasticColumn({ type: 'text', index: true })
  hashtags: string;

  @ElasticColumn({ type: 'date' })
  createdAt: Date;

  @ElasticColumn({ type: 'keyword' })
  region?: string;
}
```

## 🔧 Service Usage

### Single Region Service

```typescript
import { Injectable } from '@nestjs/common';
import { SearchService } from '@alti-js/nestjs-elasticsearch';

@Injectable()
export class PostService {
  constructor(private readonly searchService: SearchService) {}

  // Check which engine is being used
  getEngineType() {
    return this.searchService.getEngineType(); // Returns 'elasticsearch' or 'opensearch'
  }

  // Create index
  async createIndex() {
    await this.searchService.createIndex('posts', [
      { fieldName: "title", type: "text" },
      { fieldName: "content", type: "text" },
    ]);
  }

  // Bulk insert documents
  async insertPosts(posts: any[]) {
    await this.searchService.bulkInsert(posts, 'posts', 'post');
  }

  // Search documents
  async searchPosts(query: string) {
    return this.searchService.searchIndex(
      query,
      'posts',
      0,
      10,
      'SimpleQuery',
      ['title', 'content']
    );
  }

  // Update documents
  async updatePost(id: string, updates: any) {
    await this.searchService.updateIndex(
      'posts',
      { match: { id } },
      updates
    );
  }

  // Remove documents
  async removePost(id: string) {
    await this.searchService.removeDocumentFromIndex(
      'posts',
      { match: { id } }
    );
  }

  // Reindex documents
  async reindexPosts() {
    await this.searchService.reindex(
      'posts-old',
      'posts-new',
      { match_all: {} }
    );
  }
}
```

### Multi-Region Service

```typescript
import { Injectable } from '@nestjs/common';
import { MultiRegionOpenSearchService } from '@alti-js/nestjs-elasticsearch';

@Injectable()
export class MultiRegionPostService {
  constructor(
    private readonly multiRegionService: MultiRegionOpenSearchService
  ) {}

  // Add document to specific region
  async addPostToRegion(region: string, post: any) {
    return await this.multiRegionService.addDocument(
      region as any,
      'posts',
      post,
      post.id
    );
  }

  // Get document from specific region
  async getPostFromRegion(region: string, postId: string) {
    return await this.multiRegionService.getDocument(
      region as any,
      'posts',
      postId
    );
  }

  // Update document in specific region
  async updatePostInRegion(region: string, postId: string, updates: any) {
    return await this.multiRegionService.updateDocument(
      region as any,
      'posts',
      postId,
      updates
    );
  }

  // Delete document from specific region
  async deletePostFromRegion(region: string, postId: string) {
    return await this.multiRegionService.deleteDocument(
      region as any,
      'posts',
      postId
    );
  }

  // Search in specific region
  async searchInRegion(region: string, query: string) {
    return await this.multiRegionService.searchIndex(
      region as any,
      'posts',
      query,
      0,
      10,
      'SimpleQuery',
      ['title', 'content']
    );
  }

  // Search across all regions
  async searchAcrossAllRegions(query: string) {
    return await this.multiRegionService.searchAcrossRegions(
      'posts',
      query,
      0,
      10,
      'SimpleQuery',
      ['title', 'content']
    );
  }

  // Bulk insert to multiple regions
  async bulkInsertToRegions(posts: any[], regions?: string[]) {
    return await this.multiRegionService.bulkInsertAcrossRegions(
      'posts',
      posts,
      regions as any
    );
  }

  // Request-based operations (auto-detects region)
  async addPostByRequest(request: any, post: any) {
    return await this.multiRegionService.addDocumentByRequest(
      request,
      'posts',
      post,
      post.id
    );
  }

  // Get available regions
  getAvailableRegions() {
    return this.multiRegionService.getAvailableRegions();
  }
}
```

## 📚 API Reference

### SearchService Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `createIndex` | Create new index or update mapping | `(indexName, fields)` |
| `bulkInsert` | Add new documents to index | `(docs, indexName, type?)` |
| `searchIndex` | Search documents in index | `(query, indexName, skip, limit, queryType, fields)` |
| `updateIndex` | Update documents by query | `(indexName, query, updates)` |
| `removeDocumentFromIndex` | Remove documents from index | `(indexName, query)` |
| `reindex` | Reindex documents from one index to another | `(sourceIndex, destIndex, query)` |
| `getEngineType` | Get the current search engine type | `()` |

### Enhanced SearchService Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `addDocument` | Add single document | `(indexName, document, documentId?)` |
| `getDocument` | Get single document | `(indexName, documentId)` |
| `updateDocument` | Update single document | `(indexName, documentId, document)` |
| `deleteDocument` | Delete single document | `(indexName, documentId)` |
| `upsertDocument` | Upsert single document | `(indexName, documentId, document)` |
| `deleteIndex` | Delete entire index | `(indexName)` |
| `indexExists` | Check if index exists | `(indexName)` |
| `getIndexInfo` | Get index information | `(indexName)` |
| `getIndexStats` | Get index statistics | `(indexName)` |
| `getIndexHealth` | Get index health status | `(indexName)` |

### MultiRegionOpenSearchService Methods

#### Region-Specific Operations
| Method | Description | Parameters |
|--------|-------------|------------|
| `addDocument` | Add document to specific region | `(region, indexName, document, documentId?)` |
| `getDocument` | Get document from specific region | `(region, indexName, documentId)` |
| `updateDocument` | Update document in specific region | `(region, indexName, documentId, document)` |
| `deleteDocument` | Delete document from specific region | `(region, indexName, documentId)` |
| `upsertDocument` | Upsert document in specific region | `(region, indexName, documentId, document)` |
| `searchIndex` | Search in specific region | `(region, indexName, query, skip, limit, queryType, fields)` |
| `bulkInsert` | Bulk insert to specific region | `(region, indexName, documents)` |
| `createIndex` | Create index in specific region | `(region, indexName, fields)` |
| `deleteIndex` | Delete index in specific region | `(region, indexName)` |
| `indexExists` | Check if index exists in region | `(region, indexName)` |

#### Cross-Region Operations
| Method | Description | Parameters |
|--------|-------------|------------|
| `searchAcrossRegions` | Search across multiple regions | `(indexName, query, skip, limit, queryType, fields, regions?)` |
| `bulkInsertAcrossRegions` | Bulk insert across multiple regions | `(indexName, documents, regions?)` |

#### Request-Based Operations
| Method | Description | Parameters |
|--------|-------------|------------|
| `addDocumentByRequest` | Add document using request region | `(request, indexName, document, documentId?)` |
| `getDocumentByRequest` | Get document using request region | `(request, indexName, documentId)` |
| `updateDocumentByRequest` | Update document using request region | `(request, indexName, documentId, document)` |
| `deleteDocumentByRequest` | Delete document using request region | `(request, indexName, documentId)` |
| `searchByRequest` | Search using request region | `(request, indexName, query, skip, limit, queryType, fields)` |

## 🌍 Supported Regions

The multi-region functionality supports the following regions:

- **🇸🇬 Singapore** (`singapore`)
- **🇮🇩 Indonesia** (`indonesia`)
- **🇦🇺 Australia** (`australia`)
- **🇹🇭 Thailand** (`thailand`)

## 🔄 Migration Guide

### From Elasticsearch to OpenSearch

To migrate from Elasticsearch to OpenSearch, simply update your configuration:

```typescript
// Before (Elasticsearch)
ElasticsearchModule.forRoot({
  index: "test-index",
  node: "http://localhost",
  port: "9200",
  auth: {
    username: "elastic",
    password: "changeme",
  },
  models: [PostIndex],
})

// After (OpenSearch)
ElasticsearchModule.forRoot({
  index: "test-index",
  node: "http://localhost",
  port: "9200",
  auth: {
    username: "admin",
    password: "admin",
  },
  engine: "opensearch", // Add this line
  models: [PostIndex],
})
```

The API remains the same, so no code changes are required in your services.

### From Single Region to Multi-Region

To migrate from single region to multi-region setup:

```typescript
// Before (Single Region)
ElasticsearchModule.forRoot({
  index: "test-index",
  node: "http://localhost:9200",
  port: "9200",
  auth: { username: "admin", password: "admin" },
  engine: "opensearch",
})

// After (Multi-Region)
MultiRegionElasticsearchModule.forRoot({
  engine: 'opensearch',
  defaultRegion: 'singapore',
  regions: {
    singapore: {
      node: 'http://localhost:9200',
      port: '9200',
      auth: { username: 'admin', password: 'admin' }
    },
    // Add more regions as needed
  }
})
```

## 🧪 Testing

The library includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## 📦 Dependencies

### Core Dependencies
- `@elastic/elasticsearch` - For Elasticsearch support
- `@opensearch-project/opensearch` - For OpenSearch support
- `@nestjs/common` - NestJS framework
- `@nestjs/core` - NestJS core
- `@nestjs/microservices` - NestJS microservices

### Peer Dependencies
- `@nestjs/common` ^10.0.0
- `@nestjs/core` ^10.0.0

## 🚀 Performance Considerations

### Best Practices
1. **Connection Pooling**: The library automatically manages connection pools for optimal performance
2. **Bulk Operations**: Use bulk operations for inserting multiple documents
3. **Index Optimization**: Regularly optimize indices for better search performance
4. **Region Selection**: Choose the closest region for better latency
5. **Error Handling**: Implement proper error handling for production environments

### Monitoring
- Monitor connection health across all regions
- Track search performance metrics
- Set up alerts for failed operations
- Monitor index sizes and growth

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation and examples
- Review the test files for usage patterns

## 🔗 Links

- [NestJS Documentation](https://nestjs.com/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [OpenSearch Documentation](https://opensearch.org/docs/)
- [GitHub Repository](https://github.com/alti-js/nestjs-elasticsearch)

---

**Made with ❤️ by the Alti.js team**
