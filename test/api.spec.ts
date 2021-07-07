import { Server } from 'http';
import { Client } from '../src/App/client';
import { startServer } from '../src/App/server';

let client: Client;
let server: Server;

beforeEach(async() => {
  const serverInfo = await startServer();
  server = serverInfo.server;
  client = new Client({ hostname: `http://localhost:${serverInfo.address.port}` });
});

afterEach(() => {
  server.close();
});

describe('Zip Codes API', () => {
  describe('insert operation', () => {
    it('handles insertion without error', () => {
      return client.insert('10000');
    });

    it('handles multiple insertions without error', async() => {
      // Order of these inserts is important: it tests insertion logic such as
      // extending ranges forwards and backwards, joining ranges, and inserting
      // new ranges
      await client.insert('10000');
      await client.insert('10002');
      await client.insert('10003');
      await client.insert('09999');
      await client.insert('10001');
      await client.insert('00000');
    });

    it('is idempotent', async() => {
      await client.insert('10000');
      await client.insert('10000');
    });
  });

  describe('has operation', () => {
    it('returns false when zip code has not been inserted', () => {
      return expect(client.has('10000')).resolves.toBe(false);
    });

    it('returns true when zip code has been inserted', () => {
      return expect(
        client.insert('10000')
          .then(() => client.has('10000'))
      ).resolves.toBe(true);
    });
  });

  describe('delete operation', () => {
    it('returns false when zip code has not been inserted', () => {
      return expect(client.delete('10000')).resolves.toBe(false);
    });

    it('deletes inserted zip codes', () => {
      expect.assertions(2);

      return expect(
          client.insert('10000')
            .then(() => client.delete('10000'))
            .then((deleteResult) => {
              expect(deleteResult).toBe(true);
              return client.has('10000')
            })
      ).resolves.toBe(false);
    });

    it('deletes zip codes within a range', async() => {
      const zips = [
        '10000',
        '10001',
        '10002',
      ];

      await Promise.all(zips.map(client.insert));
      expect(await client.has('10001')).toBe(true);
      expect(await client.delete('10001')).toBe(true);
      expect(await client.has('10001')).toBe(false);
    });

    it('deletes zip codes at the end of a range', async() => {
      const zips = [
        '10000',
        '10001',
      ];

      await Promise.all(zips.map(client.insert));
      expect(await client.has('10001')).toBe(true);
      expect(await client.delete('10001')).toBe(true);
      expect(await client.has('10001')).toBe(false);
    });
  });

  describe('display operation', () => {
    it('returns empty string when registry is empty', async () => {
      expect(await client.display()).toBe('');
    });

    it('is correct when one zip code is inserted', async () => {
      await client.insert('10000');
      expect(await client.display()).toBe('10000');
    });

    it('is correct when one zip code range is inserted', async () => {
      const zips = [
        '10000',
        '10001',
      ];

      await Promise.all(zips.map(client.insert));
      expect(await client.display()).toBe('10000-10001');
    });

    it('is correct when a mix of ranges and lone zip codes are inserted', async () => {
      const zips = [
        '10000',
        '10001',
        '20000',
        '30000',
        '30001',
        '30002',
        '40000',
        '05000',
        '04000',
        '04001',
      ];

      await Promise.all(zips.map(client.insert));
      expect(await client.display()).toBe('04000-04001 05000 10000-10001 20000 30000-30002 40000');
    });

    it('is correct after complex interaction', async () => {
      const zips = [
        '10000',
        '10001',
        '10002',
        '10003',
        '10004',
        '20000',
        '30000',
        '30001',
        '30002',
        '30003',
        '40000',
        '05000',
        '04000',
      ];

      await Promise.all(zips.map(client.insert));
      await client.insert('20001');

      const zipsToDelete = [
        '10002',
        '30001',
        '04000',
        '40000',
      ];

      await Promise.all(zipsToDelete.map(client.delete));
      expect(await client.display()).toBe('05000 10000-10001 10003-10004 20000-20001 30000 30002-30003');
    });
  });

  it('returns 400 Bad Request for invalid zip codes', () => {
    expect.assertions(6);

    async function statusFromInsert(zip: string) {
      const res = await client.invokeInsert(zip);
      return res.status;
    }

    return Promise.all([
      expect(statusFromInsert('abcde')).resolves.toEqual(400),
      expect(statusFromInsert('a')).resolves.toEqual(400),
      expect(statusFromInsert('abcdefg')).resolves.toEqual(400),
      expect(statusFromInsert('00x00')).resolves.toEqual(400),
      expect(statusFromInsert('0')).resolves.toEqual(400),
      expect(statusFromInsert('000010')).resolves.toEqual(400),
    ]);
  });
});
