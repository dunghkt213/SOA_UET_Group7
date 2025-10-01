import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const packageDef = protoLoader.loadSync(
  join(__dirname, '../proto/hero.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  },
);

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const client = new grpcObj.hero.HeroService(
  'localhost:5000',
  grpc.credentials.createInsecure(),
);

client.FindOne({ id: 1 }, (err: any, response: any) => {
  if (err) console.error(err);
  else console.log('Hero:', response);
});
