import { Router, RequestParamHandler } from 'express';
import { config } from '../Util/config';
import { isZipCodeValid, logInvalidRequestRouting, logOpInvocation } from '../Util/util';

/**
 * Creates a new router for the zip codes api
 *
 * @param registry The zip code registry that the router will rely on for domain logic implementation
 * @returns A new express router for the zip codes api
 */
export function makeRouter(registry: IZipCodesRegistry): Router {
  const router = Router();

  /**
   *  Set param handler
   */
  router.param(zipParamSlug, parseZipParam);

  /**
   * Set endpoint handlers
   */

  /** DISPLAY */
  router.get(zipCodesIndexPath, async(req, res, next) => {
    try {
      const opName = 'displayZipCodes';
      logOpInvocation(opName);
      const result = registry.display();
      res.status(200).send(await result);
    } catch (e) {
      next(e)
    }
  });

  /** INSERT */
  router.put(zipCodeEntryPath, async(req, res, next) => {
    try {
      const opName = 'insertZipCode';
      logOpInvocation(opName);
      if (!req.params.zip) {
        logInvalidRequestRouting(opName, 'Request missing required parameter "zip"');
        res.sendStatus(500);
        return
      }

      const inserted = await registry.insert(+req.params.zip);
      if (inserted) {
        res.status(201).send();
      } else {
        res.status(200).send();
      }
    } catch (e) {
      next(e);
    }
  });

  /** DELETE */
  router.delete(zipCodeEntryPath, async(req, res, next) => {
    try {
      const opName = 'deleteZipCode';
      logOpInvocation(opName);
      if (!req.params.zip) {
        logInvalidRequestRouting(opName, 'Request missing required parameter "zip"');
        res.sendStatus(500);
        return;
      }

      const deleted = await registry.delete(+req.params.zip);
      if (deleted) {
        res.status(204).send();
      } else {
        res.sendStatus(404);
      }
    } catch (e) {
      next(e);
    }
  });

  /** HAS */
  router.get(zipCodeEntryPath, async(req, res, next) => {
    try {
      const opName = 'hasZipCode';
      logOpInvocation(opName);
      if (!req.params.zip) {
        logInvalidRequestRouting(opName, 'Request missing required parameter "zip"');
        res.sendStatus(500);
        return;
      }

      const has = await registry.has(+req.params.zip);
      if (has) {
        res.status(200).send(req.params.zip);
      } else {
        res.sendStatus(404);
      }
    } catch (e) {
      next(e);
    }
  });

  return router;
}

const zipParamSlug = 'zip';
const zipCodesIndexPath = `${config.apiPathPrefix}/zip-codes`;
const zipCodeEntryPath = `${zipCodesIndexPath}/:${zipParamSlug}`;

const parseZipParam: RequestParamHandler = (req, res, next, zip: unknown) => {
  if (
    typeof zip === 'string'
    && isZipCodeValid(zip)
  ) {
    req.params.zip = zip;
    next();
  } else {
    res.status(400).send('Bad Request - invalid zip code');
  }
}

