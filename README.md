<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
  <a href="https://kafka.js.org">
    <img src="https://raw.githubusercontent.com/tulios/kafkajs/master/logo/v2/kafkajs_circle.svg" alt="KafkaJS Logo" width="125" height="125">
  </a>
</p>

# NestJS + KafkaJS

Integration of KafkaJS with NestJS to build event driven microservices.


## Setup

Import and add the `ElasticsearchModule` to the imports array of the module for which you would like to use Kafka.

### Synchronous Module Initialization

Register the `ElasticsearchModule` synchronous with the `register()` method:

```javascript
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
      models: [
        PostIndex
      ],
    }),
  ]
  ...
})

```

Full settings can be found:

| Config | Options |
| ------ | ------- | 
| index        | ES index name | 
| node     | ES node |
| port     | ES port |
| auth     | ES auth |
| models   | ES models |
| | |



### Models

Subscribing to a topic to accept messages.

```javascript
import {
  ElasticColumn,
  ElasticIndex,
} from '@alti-js/elasticsearch/es-index.decorator';
import {
  BaseDocument,
  IDoc,
} from '@alti-js/elasticsearch/base-index.model';
export interface IPostIndex extends IDoc {
  id: string;
  title: string;
  author: string;
  content: string;
  hashtags: string;
  createdAt: Date;
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
}

```

### Service Usage

Send messages back to kafka.

```javascript
## ElasticsearchService
## Available methods:
- createIndex - creating new index or update mapping by index name
#### Example:
```
createIndex('index-name',[
  { fieldName: "title", type: "text" },
  { fieldName: "content", type: "integer" },
])
```

- bulkInsert - add new document to index
#### Example:
```
  bulkInsert(
  [{id:'someId4',title:'someTitle21',content:'some content 21',author:{username:'username 1'}, categories:[{id:'someCategId2',title:'someCategTitle12'}]}],
  'posts',
  'posts')
```
- searchIndex - search documents in index. 
#### Example:
```
searchIndex('someTitle21', 'posts',0,10,'SimpleQuery',['title','content'])
```
- updateIndex - update documents by query
#### Example:
```
 updateIndex('posts',{
    match: {
      id: 'someId4'
    }
  },{
    content:'some content new new'
  })
```
- removeDocumentFromIndex - remove document from index
#### Example:
```
  removeDocumentFromIndex('posts',{
    match: {
      id: 'someId4'
    }
  })
```
- reindex - The reindex API extracts the document source from the source index and indexes the documents into the destination index. (from elasticsearch docs)
#### Example:
```
reindex('index1','index2',{ match_all: {} })`
```


```

### Schema Registry support.

By default messages are converted to JSON objects were possible. If you're using
AVRO you can add the `SchemaRegistry` deserializer to convert the messages. This uses the [KafkaJS Schema-registry module](https://github.com/kafkajs/confluent-schema-registry)

In your `module.ts`:

```javascript

@Module({
  imports: [
    KafkaModule.register([
      {
        name: 'HERO_SERVICE',
        options: {
          client: {
            clientId: 'hero',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'hero-consumer'
          }
        },
        deserializer: new KafkaAvroResponseDeserializer({
          host: 'http://localhost:8081'
        }),
        serializer: new KafkaAvroRequestSerializer({
          config: {
            host: 'http://localhost:8081/'
          },
          schemas: [
            {
              topic: 'test.topic',
              key: join(__dirname, 'key-schema.avsc'),
              value: join(__dirname, 'value-schema.avsc')
            }
          ],
        }),
      },
    ]),
  ]
  ...
})
```