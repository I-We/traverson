(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// TODO Replace by a proper lightweight logging module, suited for the browser

var enabled = false;
function Logger(id) {
  if (id == null) {
    id = '';
  }
  this.id = id;
}

Logger.prototype.enable = function() {
  this.enabled = true;
};

Logger.prototype.debug = function(message) {
  if (enabled) {
    console.log(this.id + '/debug: ' + message);
  }
};

Logger.prototype.info = function(message) {
  if (enabled) {
    console.log(this.id + '/info: ' + message);
  }
};

Logger.prototype.warn = function(message) {
  if (enabled) {
    console.log(this.id + '/warn: ' + message);
  }
};

Logger.prototype.error = function(message) {
  if (enabled) {
    console.log(this.id + '/error: ' + message);
  }
};

function minilog(id) {
  return new Logger(id);
}

minilog.enable = function() {
  enabled = true;
};

module.exports = minilog;

},{}],2:[function(require,module,exports){
'use strict';

module.exports = {
  isArray: function(o) {
    if (o == null) {
      return false;
    }
    return Object.prototype.toString.call(o) === '[object Array]';
  }
};

},{}],3:[function(require,module,exports){
'use strict';

var superagent = require('superagent');

function Request() {}

Request.prototype.get = function(uri, options, callback) {
  return mapRequest(superagent.get(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.post = function(uri, options, callback) {
  return mapRequest(superagent.post(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.put = function(uri, options, callback) {
  return mapRequest(superagent.put(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.patch = function(uri, options, callback) {
  return mapRequest(superagent.patch(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.del = function(uri, options, callback) {
  return mapRequest(superagent.del(uri), options)
    .end(handleResponse(callback));
};

function mapRequest(superagentRequest, options) {
  options = options || {};
  mapQuery(superagentRequest, options);
  mapHeaders(superagentRequest, options);
  mapAuth(superagentRequest, options);
  mapBody(superagentRequest, options);
  mapForm(superagentRequest, options);
  mapWithCredentials(superagentRequest, options);
  return superagentRequest;
}

function mapQuery(superagentRequest, options) {
  var qs = options.qs;
  if (qs != null) {
    superagentRequest = superagentRequest.query(qs);
  }
}

function mapHeaders(superagentRequest, options) {
  var headers = options.headers;
  if (headers != null) {
    superagentRequest = superagentRequest.set(headers);
  }
}

function mapAuth(superagentRequest, options) {
  var auth = options.auth;
  if (auth != null) {
    superagentRequest = superagentRequest.auth(
      auth.user || auth.username,
      auth.pass || auth.password
    );
  }
}

function mapBody(superagentRequest, options) {
  if (options != null) {
    var body = options.body;
    if (body != null) {
      superagentRequest = superagentRequest.send(body);
    }
  }
}

function mapForm(superagentRequest, options) {
  if (options != null) {
    var form = options.form;
    if (form != null) {
      // content-type header needs to be set before calling send AND it NEEDS
      // to be all lower case otherwise superagent automatically sets
      // application/json as content-type :-/
      superagentRequest = superagentRequest.set('content-type',
          'application/x-www-form-urlencoded');
      superagentRequest = superagentRequest.send(form);
    }
  }
}

function mapWithCredentials(superagentRequest, options) {
  if (options != null) {
    var withCredentials = options.withCredentials;
    if (withCredentials === true) {
      // https://visionmedia.github.io/superagent/#cors
      superagentRequest.withCredentials();
    }
  }
}

// map XHR response object properties to Node.js request lib's response object
// properties
function mapResponse(response) {
  response.body = response.text;
  response.statusCode = response.status;
  return response;
}

function handleResponse(callback) {
  return function(err, response) {
    if (err) {
      if (!response) {
        // network error or timeout, no response
        return callback(err);
      } else {
        // Since 1.0.0 superagent calls the callback with an error if the status
        // code of the response is not in the 2xx range. In this cases, it also
        // passes in the response. To align things with request, call the
        // callback without the error but just with the response.
        callback(null, mapResponse(response));
      }
    } else {
      callback(null, mapResponse(response));
    }
  };
}

module.exports = new Request();

},{"superagent":48}],4:[function(require,module,exports){
'use strict';

/*
 * Copied from underscore.string module. Just the functions we need, to reduce
 * the browserified size.
 */

var _s = {
  startsWith: function(str, starts) {
    if (starts === '') return true;
    if (str == null || starts == null) return false;
    str = String(str); starts = String(starts);
    return str.length >= starts.length && str.slice(0, starts.length) === starts;
  },

  endsWith: function(str, ends){
    if (ends === '') return true;
    if (str == null || ends == null) return false;
    str = String(str); ends = String(ends);
    return str.length >= ends.length &&
      str.slice(str.length - ends.length) === ends;
  },

  splice: function(str, i, howmany, substr){
    var arr = _s.chars(str);
    arr.splice(~~i, ~~howmany, substr);
    return arr.join('');
  },

  contains: function(str, needle){
    if (needle === '') return true;
    if (str == null) return false;
    return String(str).indexOf(needle) !== -1;
  },

  chars: function(str) {
    if (str == null) return [];
    return String(str).split('');
  }
};

module.exports = _s;

},{}],5:[function(require,module,exports){
'use strict';

var resolveUrl = require('resolve-url');

exports.resolve = function(from, to) {
  return resolveUrl(from, to);
};

},{"resolve-url":47}],6:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

exports.abortTraversal = function abortTraversal() {
  log.debug('aborting link traversal');
  this.aborted = true;
  if (this.currentRequest) {
    log.debug('request in progress. trying to abort it, too.');
    this.currentRequest.abort();
  }
};

exports.registerAbortListener = function registerAbortListener(t, callback) {
  if (t.currentRequest) {
    t.currentRequest.on('abort', function() {
      exports.callCallbackOnAbort(t);
    });
  }
};

exports.callCallbackOnAbort = function callCallbackOnAbort(t) {
  log.debug('link traversal aborted');
  if (!t.callbackHasBeenCalledAfterAbort) {
    t.callbackHasBeenCalledAfterAbort = true;
    t.callback(exports.abortError(), t);
  }
};

exports.abortError = function abortError() {
  var error = new Error('Link traversal process has been aborted.');
  error.name = 'AbortError';
  error.aborted = true;
  return error;
};

},{"minilog":1}],7:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , applyTransforms = require('./transforms/apply_transforms')
  , httpRequests = require('./http_requests')
  , isContinuation = require('./is_continuation')
  , walker = require('./walker');

var checkHttpStatus = require('./transforms/check_http_status')
  , continuationToDoc =
      require('./transforms/continuation_to_doc')
  , continuationToResponse =
      require('./transforms/continuation_to_response')
  , convertEmbeddedDocToResponse =
      require('./transforms/convert_embedded_doc_to_response')
  , extractDoc =  require('./transforms/extract_doc')
  , extractResponse =  require('./transforms/extract_response')
  , extractUrl =  require('./transforms/extract_url')
  , fetchLastResource =  require('./transforms/fetch_last_resource')
  , executeLastHttpRequest = require('./transforms/execute_last_http_request')
  , executeHttpRequest = require('./transforms/execute_http_request')
  , parse = require('./transforms/parse');

/**
 * Starts the link traversal process and end it with an HTTP get.
 */
exports.get = function(t, callback) {
  var transformsAfterLastStep;
  if (t.convertResponseToObject) {
    transformsAfterLastStep = [
      continuationToDoc,
      fetchLastResource,
      checkHttpStatus,
      parse,
      extractDoc,
    ];
  } else {
    transformsAfterLastStep = [
      continuationToResponse,
      fetchLastResource,
      convertEmbeddedDocToResponse,
      extractResponse,
    ];
  }
  walker.walk(t, transformsAfterLastStep, callback);
  return createTraversalHandle(t);
};

/**
 * Special variant of get() that does not execute the last request but instead
 * yields the last URL to the callback.
 */
exports.getUrl = function(t, callback) {
  walker.walk(t, [ extractUrl ], callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
exports.post = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.post,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
exports.put = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.put,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
exports.patch = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.patch,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
exports.delete = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.del,
      callback);
  return createTraversalHandle(t);
};

function walkAndExecute(t, request, method, callback) {
  var transformsAfterLastStep;
  if (t.convertResponseToObject) {
    transformsAfterLastStep = [
      executeHttpRequest,
      checkHttpStatus,
      parse,
      extractDoc,
    ];
  } else {
    transformsAfterLastStep = [
      executeLastHttpRequest,
    ];
  }

  t.lastMethod = method;
  walker.walk(t, transformsAfterLastStep, callback);
}

function createTraversalHandle(t) {
  return {
    abort: t.abortTraversal
  };
}

},{"./abort_traversal":6,"./http_requests":9,"./is_continuation":10,"./transforms/apply_transforms":16,"./transforms/check_http_status":17,"./transforms/continuation_to_doc":18,"./transforms/continuation_to_response":19,"./transforms/convert_embedded_doc_to_response":20,"./transforms/execute_http_request":22,"./transforms/execute_last_http_request":23,"./transforms/extract_doc":24,"./transforms/extract_response":25,"./transforms/extract_url":26,"./transforms/fetch_last_resource":27,"./transforms/parse":30,"./walker":36,"minilog":1}],8:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , standardRequest = require('request')
  , util = require('util');

var actions = require('./actions')
  , abortTraversal = require('./abort_traversal').abortTraversal
  , mediaTypeRegistry = require('./media_type_registry')
  , mediaTypes = require('./media_types')
  , mergeRecursive = require('./merge_recursive');

var log = minilog('traverson');

// Maintenance notice: The constructor is usually called without arguments, the
// mediaType parameter is only used when cloning the request builder in
// newRequest().
function Builder(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  this.adapter = this._createAdapter(this.mediaType);
  this.contentNegotiation = true;
  this.convertResponseToObjectFlag = false;
  this.links = [];
  this.jsonParser = JSON.parse;
  this.requestModuleInstance = standardRequest;
  this.requestOptions = {};
  this.resolveRelativeFlag = false;
  this.preferEmbedded = false;
  this.lastTraversalState = null;
  this.continuation = null;
  // Maintenance notice: when extending the list of configuration parameters,
  // also extend this.newRequest and initFromTraversalState
}

Builder.prototype._createAdapter = function(mediaType) {
  var AdapterType = mediaTypeRegistry.get(mediaType);
  if (!AdapterType) {
    throw new Error('Unknown or unsupported media type: ' + mediaType);
  }
  log.debug('creating new ' + AdapterType.name);
  return new AdapterType(log);
};

/**
 * Returns a new builder instance which is basically a clone of this builder
 * instance. This allows you to initiate a new request but keeping all the setup
 * (start URL, template parameters, request options, body parser, ...).
 */
Builder.prototype.newRequest = function() {
  var clonedRequestBuilder = new Builder(this.getMediaType());
  clonedRequestBuilder.contentNegotiation =
    this.doesContentNegotiation();
  clonedRequestBuilder.convertResponseToObject(this.convertsResponseToObject());
  clonedRequestBuilder.from(shallowCloneArray(this.getFrom()));
  clonedRequestBuilder.withTemplateParameters(
    cloneArrayOrObject(this.getTemplateParameters()));
  clonedRequestBuilder.withRequestOptions(
    cloneArrayOrObject(this.getRequestOptions()));
  clonedRequestBuilder.withRequestLibrary(this.getRequestLibrary());
  clonedRequestBuilder.parseResponseBodiesWith(this.getJsonParser());
  clonedRequestBuilder.resolveRelative(this.doesResolveRelative());
  clonedRequestBuilder.preferEmbeddedResources(
      this.doesPreferEmbeddedResources());
  clonedRequestBuilder.continuation = this.continuation;
  // Maintenance notice: when extending the list of configuration parameters,
  // also extend initFromTraversalState
  return clonedRequestBuilder;
};

/**
 * Disables content negotiation and forces the use of a given media type.
 * The media type has to be registered at Traverson's media type registry
 * before via traverson.registerMediaType (except for media type
 * application/json, which is traverson.mediaTypes.JSON).
 */
Builder.prototype.setMediaType = function(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  this.adapter = this._createAdapter(mediaType);
  this.contentNegotiation =
    (mediaType === mediaTypes.CONTENT_NEGOTIATION);
  return this;
};

/**
 * Shortcut for
 * setMediaType(traverson.mediaTypes.JSON);
 */
Builder.prototype.json = function() {
  this.setMediaType(mediaTypes.JSON);
  return this;
};

/**
 * Shortcut for
 * setMediaType(traverson.mediaTypes.JSON_HAL);
 */
Builder.prototype.jsonHal = function() {
  this.setMediaType(mediaTypes.JSON_HAL);
  return this;
};

/**
 * Enables content negotiation (content negotiation is enabled by default, this
 * method can be used to enable it after a call to setMediaType disabled it).
 */
Builder.prototype.useContentNegotiation = function() {
  this.setMediaType(mediaTypes.CONTENT_NEGOTIATION);
  this.contentNegotiation = true;
  return this;
};

/**
 * Set the root URL of the API, that is, where the link traversal begins.
 */
Builder.prototype.from = function(url) {
  this.startUrl = url;
  return this;
};

/**
 * Adds link relations to the list of link relations to follow. The initial list
 * of link relations is the empty list. Each link relation in this list
 * corresponds to one step in the traversal.
 */
Builder.prototype.follow = function() {
  var newLinks = Array.prototype.slice.apply(
    arguments.length === 1 && util.isArray(arguments[0]) ?
      arguments[0] : arguments
  );

  for (var i = 0; i < newLinks.length; i++) {
    if (typeof newLinks[i] === 'string') {
      newLinks[i] = {
        type: 'link-rel',
        value: newLinks[i],
      };
    }
  }
  this.links = this.links.concat(newLinks);
  return this;
};

/**
 * Adds a special step to the list of link relations that will follow the
 * location header, that is, instead of reading the next URL from a link in the
 * document body, it uses the location header and follows the URL from this
 * header.
 */
Builder.prototype.followLocationHeader = function() {
  this.links.push({
    type: 'header',
    value: 'location',
  });
  return this;
};

/**
 * Alias for follow.
 */
Builder.prototype.walk = Builder.prototype.follow;

/**
 * Provide template parameters for URI template substitution.
 */
Builder.prototype.withTemplateParameters = function(parameters) {
  this.templateParameters = parameters;
  return this;
};

/**
 * Provide options for HTTP requests (additional HTTP headers, for example).
 * This function resets any request options, that had been set previously, that
 * is, multiple calls to withRequestOptions are not cumulative. Use
 * addRequestOptions to add request options in a cumulative way.
 *
 * Options can either be passed as an object or an array. If an object is
 * passed, the options will be used for each HTTP request. If an array is
 * passed, each element should be an options object and the first array element
 * will be used for the first request, the second element for the second request
 * and so on. null elements are allowed.
 */
Builder.prototype.withRequestOptions = function(options) {
  this.requestOptions = options;
  return this;
};

/**
 * Adds options for HTTP requests (additional HTTP headers, for example) on top
 * of existing options, if any. To reset all request options and set new ones
 * without keeping the old ones, you can use withRequestOptions.
 *
 * Options can either be passed as an object or an array. If an object is
 * passed, the options will be used for each HTTP request. If an array is
 * passed, each element should be an options object and the first array element
 * will be used for the first request, the second element for the second request
 * and so on. null elements are allowed.
 *
 * When called after a call to withRequestOptions or when combining multiple
 * addRequestOptions calls, some with objects and some with arrays, a multitude
 * of interesting situations can occur:
 *
 * 1) The existing request options are an object and the new options passed into
 * this method are also an object. Outcome: Both objects are merged and all
 * options are applied to all requests.
 *
 * 2) The existing options are an array and the new options passed into this
 * method are also an array. Outcome: Each array element is merged individually.
 * The combined options from the n-th array element in the existing options
 * array and the n-th array element in the given array are applied to the n-th
 * request.
 *
 * 3) The existing options are an object and the new options passed into this
 * method are an array. Outcome: A new options array will be created. For each
 * element, a clone of the existing options object will be merged with an
 * element from the given options array.
 *
 * Note that if the given array has less elements than the number of steps in
 * the link traversal (usually the number of steps is derived from the number
 * of link relations given to the follow method), only the first n http
 * requests will use options at all, where n is the number of elements in the
 * given array. HTTP request n + 1 and all following HTTP requests will use an
 * empty options object. This is due to the fact, that at the time of creating
 * the new options array, we can not know with certainty how many steps the
 * link traversal will have.
 *
 * 4) The existing options are an array and the new options passed into this
 * method are an object. Outcome: A clone of the given options object will be
 * merged into into each array element of the existing options.
 */
Builder.prototype.addRequestOptions = function(options) {

  // case 2: both the present options and the new options are arrays.
  // => merge each array element individually
  if (util.isArray(this.requestOptions) && util.isArray(options)) {
    mergeArrayElements(this.requestOptions, options);

  // case 3: there is an options object the new options are an array.
  // => create a new array, each element is a merge of the existing base object
  // and the array element from the new options array.
  } else if (typeof this.requestOptions === 'object' &&
             util.isArray(options)) {
    this.requestOptions =
      mergeBaseObjectWithArrayElements(this.requestOptions, options);

  // case 4: there is an options array and the new options are an object.
  // => merge the new object into each array element.
  } else if (util.isArray(this.requestOptions) &&
             typeof options === 'object') {
    mergeOptionObjectIntoEachArrayElement(this.requestOptions, options);

  // case 1: both are objects
  // => merge both objects
  } else {
    mergeRecursive(this.requestOptions, options);
  }
  return this;
};

function mergeArrayElements(existingOptions, newOptions) {
  for (var i = 0;
       i < Math.max(existingOptions.length, newOptions.length);
       i++) {
    existingOptions[i] =
      mergeRecursive(existingOptions[i], newOptions[i]);
  }
}

function mergeBaseObjectWithArrayElements(existingOptions, newOptions) {
  var newOptArray = [];
  for (var i = 0;
       i < newOptions.length;
       i++) {
    newOptArray[i] =
      mergeRecursive(newOptions[i], existingOptions);
  }
  return newOptArray;
}

function mergeOptionObjectIntoEachArrayElement(existingOptions, newOptions) {
  for (var i = 0;
       i < existingOptions.length;
       i++) {
    mergeRecursive(existingOptions[i], newOptions);
  }
}

/**
 * Injects a custom request library. When using this method, you should not
 * call withRequestOptions or addRequestOptions but instead pre-configure the
 * injected request library instance before passing it to withRequestLibrary.
 */
Builder.prototype.withRequestLibrary = function(request) {
  this.requestModuleInstance = request;
  return this;
};

/**
 * Injects a custom JSON parser.
 */
Builder.prototype.parseResponseBodiesWith = function(parser) {
  this.jsonParser = parser;
  return this;
};

/**
 * With this option enabled, the body of the response at the end of the
 * traversal will be converted into a JavaScript object (for example by passing
 * it into JSON.parse) and passing the resulting object into the callback.
 * The default is false, which means the full response is handed to the
 * callback.
 *
 * When response body conversion is enabled, you will not get the full
 * response, so you won't have access to the HTTP status code or headers.
 * Instead only the converted object will be passed into the callback.
 *
 * Note that the body of any intermediary responses during the traversal is
 * always converted by Traverson (to find the next link).
 *
 * If the method is called without arguments (or the first argument is undefined
 * or null), response body conversion is switched on, otherwise the argument is
 * interpreted as a boolean flag. If it is a truthy value, response body
 * conversion is switched to on, if it is a falsy value (but not null or
 * undefined), response body conversion is switched off.
 */
Builder.prototype.convertResponseToObject = function(flag) {
  if (typeof flag === 'undefined' || flag === null) {
    flag = true;
  }
  this.convertResponseToObjectFlag = !!flag;
  return this;
};

/**
 * Switches URL resolution to relative (default is absolute) or back to
 * absolute.
 *
 * If the method is called without arguments (or the first argument is undefined
 * or null), URL resolution is switched to relative, otherwise the argument is
 * interpreted as a boolean flag. If it is a truthy value, URL resolution is
 * switched to relative, if it is a falsy value, URL resolution is switched to
 * absolute.
 */
Builder.prototype.resolveRelative = function(flag) {
  if (typeof flag === 'undefined' || flag === null) {
    flag = true;
  }
  this.resolveRelativeFlag = !!flag;
  return this;
};

/**
 * Makes Traverson prefer embedded resources over traversing a link or vice
 * versa. This only applies to media types which support embedded resources
 * (like HAL). It has no effect when using a media type that does not support
 * embedded resources.
 *
 * It also only takes effect when a resource contains both a link _and_ an
 * embedded resource with the name that is to be followed at this step in the
 * link traversal process.
 *
 * If the method is called without arguments (or the first argument is undefined
 * or null), embedded resources will be preferred over fetching linked resources
 * with an additional HTTP request. Otherwise the argument is interpreted as a
 * boolean flag. If it is a truthy value, embedded resources will be preferred,
 * if it is a falsy value, traversing the link relation will be preferred.
 */
Builder.prototype.preferEmbeddedResources = function(flag) {
  if (typeof flag === 'undefined' || flag === null) {
    flag = true;
  }
  this.preferEmbedded = !!flag;
  return this;
};

/**
 * Returns the current media type. If no media type is enforced but content type
 * detection is used, the string `content-negotiation` is returned.
 */
Builder.prototype.getMediaType = function() {
  return this.mediaType;
};

/**
 * Returns the URL set by the from(url) method, that is, the root URL of the
 * API.
 */
Builder.prototype.getFrom = function() {
  return this.startUrl;
};

/**
 * Returns the template parameters set by the withTemplateParameters.
 */
Builder.prototype.getTemplateParameters = function() {
  return this.templateParameters;
};

/**
 * Returns the request options set by the withRequestOptions or
 * addRequestOptions.
 */
Builder.prototype.getRequestOptions = function() {
  return this.requestOptions;
};

/**
 * Returns the custom request library instance set by withRequestLibrary or the
 * standard request library instance, if a custom one has not been set.
 */
Builder.prototype.getRequestLibrary = function() {
  return this.requestModuleInstance;
};

/**
 * Returns the custom JSON parser function set by parseResponseBodiesWith or the
 * standard parser function, if a custom one has not been set.
 */
Builder.prototype.getJsonParser = function() {
  return this.jsonParser;
};

/**
 * Returns true if the body of the last response will be converted to a
 * JavaScript object before passing the result back to the callback.
 */
Builder.prototype.convertsResponseToObject = function() {
  return this.convertResponseToObjectFlag;
};

/**
 * Returns the flag controlling if URLs are resolved relative or absolute.
 * A return value of true means that URLs are resolved relative, false means
 * absolute.
 */
Builder.prototype.doesResolveRelative = function() {
  return this.resolveRelativeFlag;
};

/**
 * Returns the flag controlling if embedded resources are preferred over links.
 * A return value of true means that embedded resources are preferred, false
 * means that following links is preferred.
 */
Builder.prototype.doesPreferEmbeddedResources = function() {
  return this.preferEmbedded;
};

/**
 * Returns true if content negotiation is enabled and false if a particular
 * media type is forced.
 */
Builder.prototype.doesContentNegotiation = function() {
  return this.contentNegotiation;
};

/**
 * Starts the link traversal process and passes the last HTTP response to the
 * callback.
 */
Builder.prototype.get = function get(callback) {
  log.debug('initiating traversal (get)');
  var t = createInitialTraversalState(this);
  return actions.get(t, wrapForContinue(this, t, callback, 'get'));
};

/**
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 *
 * This is a shortcut for builder.convertResponseToObject().get(callback).
 */
Builder.prototype.getResource = function getResource(callback) {
  log.debug('initiating traversal (getResource)');
  this.convertResponseToObjectFlag = true;
  var t = createInitialTraversalState(this);
  return actions.get(t, wrapForContinue(this, t, callback,
      'getResource'));
};

/**
 * Special variant of get() that does not execute the last request but instead
 * yields the last URL to the callback.
 */
Builder.prototype.getUrl = function getUrl(callback) {
  log.debug('initiating traversal (getUrl)');
  var t = createInitialTraversalState(this);
  return actions.getUrl(t, wrapForContinue(this, t, callback, 'getUrl'));
};

/**
 * Alias for getUrl.
 */
Builder.prototype.getUri = Builder.prototype.getUrl;


/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
Builder.prototype.post = function post(body, callback) {
  log.debug('initiating traversal (post)');
  var t = createInitialTraversalState(this, body);
  return actions.post(t, wrapForContinue(this, t, callback, 'post'));
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
Builder.prototype.put = function put(body, callback) {
  log.debug('initiating traversal (put)');
  var t = createInitialTraversalState(this, body);
  return actions.put(t, wrapForContinue(this, t, callback, 'put'));
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
Builder.prototype.patch = function patch(body, callback) {
  log.debug('initiating traversal (patch)');
  var t = createInitialTraversalState(this, body);
  return actions.patch(t, wrapForContinue(this, t, callback, 'patch'));
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
Builder.prototype.delete = function del(callback) {
  log.debug('initiating traversal (delete)');
  var t = createInitialTraversalState(this);
  return actions.delete(t, wrapForContinue(this, t, callback, 'delete'));
};

/**
 * Alias for delete.
 */
Builder.prototype.del = Builder.prototype.delete;

function createInitialTraversalState(self, body) {

  var traversalState = {
    aborted: false,
    adapter: self.adapter || null,
    body: body || null,
    callbackHasBeenCalledAfterAbort: false,
    contentNegotiation: self.doesContentNegotiation(),
    continuation: null,
    convertResponseToObject: self.convertsResponseToObject(),
    links: self.links,
    jsonParser: self.getJsonParser(),
    requestModuleInstance: self.getRequestLibrary(),
    requestOptions: self.getRequestOptions(),
    resolveRelative: self.doesResolveRelative(),
    preferEmbedded: self.doesPreferEmbeddedResources(),
    startUrl: self.startUrl,
    step : {
      url: self.startUrl,
      index: 0,
    },
    templateParameters: self.getTemplateParameters(),
  };
  traversalState.abortTraversal = abortTraversal.bind(traversalState);

  if (self.continuation) {
    traversalState.continuation = self.continuation;
    traversalState.step = self.continuation.step;
    self.continuation = null;
  }

  return traversalState;
}

function wrapForContinue(self, t, callback, firstTraversalAction) {
  return function(err, result) {
    if (err) { return callback(err); }
    return callback(null, result, {
      continue: function() {
        if (!t) {
          throw new Error('no traversal state to continue from.');
        }

        log.debug('> continuing finished traversal process');
        self.continuation = {
          step: t.step,
          action: firstTraversalAction,
        };
        self.continuation.step.index = 0;
        initFromTraversalState(self, t);
        return self;
      },
    });
  };
}

/*
 * Copy configuration from traversal state to builder instance to
 * prepare for next traversal process.
 */
function initFromTraversalState(self, t) {
  self.aborted = false;
  self.adapter = t.adapter;
  self.body = t.body;
  self.callbackHasBeenCalledAfterAbort = false;
  self.contentNegotiation = t.contentNegotiation;
  self.convertResponseToObjectFlag = t.convertResponseToObject;
  self.links = [];
  self.jsonParser =  t.jsonParser;
  self.requestModuleInstance = t.requestModuleInstance,
  self.requestOptions = t.requestOptions,
  self.resolveRelativeFlag = t.resolveRelative;
  self.preferEmbedded = t.preferEmbedded;
  self.startUrl = t.startUrl;
  self.templateParameters = t.templateParameters;
}

function cloneArrayOrObject(thing) {
  if (util.isArray(thing)) {
    return shallowCloneArray(thing);
  } else if (typeof thing === 'object') {
    return deepCloneObject(thing);
  } else {
    return thing;
  }
}

function deepCloneObject(object) {
  return mergeRecursive(null, object);
}

function shallowCloneArray(array) {
  if (!array) {
    return array;
  }
  return array.slice(0);
}

module.exports = Builder;

},{"./abort_traversal":6,"./actions":7,"./media_type_registry":12,"./media_types":13,"./merge_recursive":14,"minilog":1,"request":3,"util":2}],9:[function(require,module,exports){
(function (process){
'use strict';
var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , detectContentType = require('./transforms/detect_content_type')
  , getOptionsForStep = require('./transforms/get_options_for_step');

/**
 * Executes a HTTP GET request during the link traversal process.
 */
// This method is currently used for all intermediate GET requests during the
// link traversal process. Coincidentally, it is also used for the final request
// in a link traversal should this happen to be a GET request. Otherwise (POST/
// PUT/PATCH/DELETE), Traverson uses exectueHttpRequest.
exports.fetchResource = function fetchResource(t, callback) {
  log.debug('fetching resource for next step');
  if (t.step.url) {
    log.debug('fetching resource from ', t.step.url);
    return executeHttpGet(t, callback);
  } else if (t.step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('resource for next step has already been fetched, using ' +
        'embedded');
    return process.nextTick(function() {
      callback(null, t);
    });
  } else {
    return process.nextTick(function() {
      var error = new Error('Can not process step');
      error.step = t.step;
      callback(error, t);
    });
  }
};

function executeHttpGet(t, callback) {
  var options = getOptionsForStep(t);
  log.debug('HTTP GET request to ', t.step.url);
  log.debug('options ', options);
  t.currentRequest =
    t.requestModuleInstance.get(t.step.url, options,
        function(err, response, body) {
    log.debug('HTTP GET request to ' + t.step.url + ' returned');
    t.currentRequest = null;

    // workaround for cases where response body is empty but body comes in as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    t.step.response = response;

    if (err) {
     return callback(err, t);
    }
    log.debug('request to ' + t.step.url + ' finished without error (' +
      response.statusCode + ')');

    if (!detectContentType(t, callback)) return;

    return callback(null, t);
  });
  abortTraversal.registerAbortListener(t, callback);
}

/**
 * Executes an arbitrary HTTP request.
 */
// This method is currently used for POST/PUT/PATCH/DELETE at the end of a link
// traversal process. If the link traversal process requires a GET as the last
// request, Traverson uses exectueHttpGet.
exports.executeHttpRequest = function(t, request, method, callback) {
  var requestOptions = getOptionsForStep(t);
  if (t.body) {
    requestOptions.body = JSON.stringify(t.body);
  }

  log.debug('HTTP ' + method.name + ' request to ', t.step.url);
  log.debug('options ', requestOptions);
  t.currentRequest =
    method.call(request, t.step.url, requestOptions,
        function(err, response, body) {
    log.debug('HTTP ' + method.name + ' request to ' + t.step.url +
      ' returned');
    t.currentRequest = null;

    // workaround for cases where response body is empty but body comes in as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    t.step.response = response;

    if (err) {
      return callback(err);
    }

    return callback(null, response);
  });
  abortTraversal.registerAbortListener(t, callback);
};

}).call(this,require('_process'))
},{"./abort_traversal":6,"./transforms/detect_content_type":21,"./transforms/get_options_for_step":29,"_process":45,"minilog":1}],10:[function(require,module,exports){
'use strict';

module.exports = function isContinuation(t) {
  return t.continuation && t.step && t.step.response;
};

},{}],11:[function(require,module,exports){
'use strict';

var jsonpath = require('jsonpath-plus')
  , minilog = require('minilog')
  , _s = require('underscore.string');

function JsonAdapter(log) {
  this.log = log;
}

JsonAdapter.prototype.findNextStep = function(t, link) {
  validateLinkObject(link);
  var doc = t.lastStep.doc;
  this.log.debug('resolving link', link);
  switch (link.type) {
    case 'link-rel':
      return this._handleLinkRel(doc, link);
    case 'header':
      return this._handleHeader(t.lastStep.response, link);
    default:
      throw new Error('Link objects with type ' + link.type + ' are not ' +
        'supported by this adapter.', link);
  }
};

JsonAdapter.prototype._handleLinkRel = function(doc, link) {
  var linkRel = link.value;
  this.log.debug('looking for link-rel in doc', linkRel, doc);
  var url;
  if (this._testJSONPath(linkRel)) {
    return { url: this._resolveJSONPath(doc, linkRel) };
  } else if (doc[linkRel]) {
    return { url : doc[linkRel] };
  } else {
    throw new Error('Could not find property ' + linkRel +
        ' in document:\n', doc);
  }
};

function validateLinkObject(link) {
  if (typeof link === 'undefined' || link === null) {
    throw new Error('Link object is null or undefined.');
  }
  if (typeof link !== 'object') {
    throw new Error('Links must be objects, not ' + typeof link +
        ': ', link);
  }
  if (!link.type) {
    throw new Error('Link objects has no type attribute.', link);
  }
}

JsonAdapter.prototype._testJSONPath = function(link) {
  return _s.startsWith(link, '$.') || _s.startsWith(link, '$[');
};

JsonAdapter.prototype._resolveJSONPath = function(doc, link) {
  var matches = jsonpath({
    json: doc,
    path: link,
  });
  if (matches.length === 1) {
    var url = matches[0];
    if (!url) {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc));
    }
    if (typeof url !== 'string') {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result is not a property of type string. ' +
        'Instead it has type "' + (typeof url) +
        '" in document:\n' + JSON.stringify(doc));
    }
    return url;
  } else if (matches.length > 1) {
    // ambigious match
    throw new Error('JSONPath expression ' + link +
      ' returned more than one match in document:\n' +
      JSON.stringify(doc));
  } else {
    // no match at all
    throw new Error('JSONPath expression ' + link +
      ' returned no match in document:\n' + JSON.stringify(doc));
  }
};

JsonAdapter.prototype._handleHeader = function(httpResponse, link) {
  switch (link.value) {
    case 'location':
      var locationHeader = httpResponse.headers.location;
      if (!locationHeader) {
        throw new Error('Following the location header but there was no ' +
          'location header in the last response.');
      }
      return { url : locationHeader };
    default:
      throw new Error('Link objects with type header and value ' + link.value +
        ' are not supported by this adapter.', link);
  }
};

module.exports = JsonAdapter;

},{"jsonpath-plus":44,"minilog":1,"underscore.string":4}],12:[function(require,module,exports){
'use strict';

var mediaTypes = require('./media_types');

var registry = {};

exports.register = function register(contentType, constructor) {
  registry[contentType] = constructor;
};

exports.get = function get(contentType) {
  return registry[contentType];
};

exports.register(mediaTypes.CONTENT_NEGOTIATION,
    require('./negotiation_adapter'));
exports.register(mediaTypes.JSON, require('./json_adapter'));

},{"./json_adapter":11,"./media_types":13,"./negotiation_adapter":15}],13:[function(require,module,exports){
'use strict';

module.exports = {
  CONTENT_NEGOTIATION: 'content-negotiation',
  JSON: 'application/json',
  JSON_HAL: 'application/hal+json',
};

},{}],14:[function(require,module,exports){
'use strict';

// TODO Maybe replace with https://github.com/Raynos/xtend
// check browser build size, though.
function mergeRecursive(obj1, obj2) {
  if (!obj1 && obj2) {
    obj1 = {};
  }
  for (var key in obj2) {
    if (!obj2.hasOwnProperty(key)) {
      continue;
    }
    merge(obj1, obj2, key);
  }
  return obj1;
}

function merge(obj1, obj2, key) {
  if (typeof obj2[key] === 'object') {
    // if it is an object (that is, a non-leave in the tree),
    // and it is not present in obj1
    if (!obj1[key] || typeof obj1[key] !== 'object') {
      // ... we create an empty object in obj1
      obj1[key] = {};
    }
    // and we recurse deeper into the structure
    mergeRecursive(obj1[key], obj2[key]);
  } else if (typeof obj2[key] !== 'function') {
    // if it is primitive (string, number, boolean), we overwrite/add it to
    // obj1
    obj1[key] = obj2[key];
  }
}

module.exports = mergeRecursive;

},{}],15:[function(require,module,exports){
'use strict';

function NegotiationAdapter(log) {}

NegotiationAdapter.prototype.findNextStep = function(doc, link) {
  throw new Error('Content negotiation did not happen');
};

module.exports = NegotiationAdapter;

},{}],16:[function(require,module,exports){
(function (process){
/* jshint loopfunc: true */
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

/*
 * Applies async and sync transforms, one after another.
 */
function applyTransforms(transforms, t, callback) {
  log.debug('applying', transforms.length, 'transforms');
  for (var i = 0; i < transforms.length; i++) {
    var transform = transforms[i];
    log.debug('next transform', transform);
    if (transform.isAsync) {
      // asynchronous case
      return transform(t, function(t) {
        // this is only called when the async transform was successful,
        // otherwise t.callback has already been called with an error.
        applyTransforms(transforms.slice(i + 1), t, callback);
      });
    } else {
      // synchronous case
      var result = transform(t);
      if (!result) {
        log.debug('transform has failed or was a final transform');
        // stop processing t.callback has already been called
        return;
      }
    }
  }
  log.debug('all transformations done, starting next step');
  return process.nextTick(function() {
    callback(t);
  });
}

module.exports = applyTransforms;

}).call(this,require('_process'))
},{"_process":45,"minilog":1}],17:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , isContinuation = require('../is_continuation');

module.exports = function checkHttpStatus(t) {
  // this step is ommitted for continuations
  if (isContinuation(t)) {
    return true;
  }

  log.debug('checking http status');
  if (!t.step.response && t.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('found embedded document, assuming no HTTP request has been ' +
        'made');
    return true;
  }

  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  var httpStatus = t.step.response.statusCode;
  if (httpStatus && (httpStatus < 200 || httpStatus >= 300)) {
    var error = httpError(t.step.url, httpStatus, t.step.response.body);
    log.error('unexpected http status code');
    log.error(error);
    t.callback(error);
    return false;
  }
  log.debug('http status code ok (' + httpStatus + ')');
  return true;
};

function httpError(url, httpStatus, body) {
  var error = new Error('HTTP GET for ' + url +
      ' resulted in HTTP status code ' + httpStatus + '.');
  error.name = 'HTTPError';
  error.url = url;
  error.httpStatus = httpStatus;
  error.body = body;
  try {
    error.doc = JSON.parse(body);
  } catch (e) {
    // ignore
  }
  return error;
}

},{"../is_continuation":10,"minilog":1}],18:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , isContinuation = require('../is_continuation');

/*
 * This transform covers the case of a follow() call *without any links* after
 * a continue(). Actually, there is nothing to do here since we should have
 * fetched everything last time.
 */
module.exports = function continuationToDoc(t) {
  if (isContinuation(t)) {
    log.debug('continuing from last traversal process (actions)');
    t.continuation = null;
    t.callback(null, t.step.doc);
    return false;
  }
  return true;
};

},{"../is_continuation":10,"minilog":1}],19:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , convertEmbeddedDocToResponse =
      require('./convert_embedded_doc_to_response')
  , isContinuation = require('../is_continuation');

/*
 * follow() call without links after continue(). Actually, there is nothing
 * to do here since we should have fetched everything last time.
 */
module.exports = function continuationToResponse(t) {
  if (isContinuation(t)) {
    log.debug('continuing from last traversal process (actions)');
    t.continuation = null;
    // Hm, a transform using another transform. This feels a bit fishy.
    convertEmbeddedDocToResponse(t);
    t.callback(null, t.step.response);
    return false;
  }
  return true;
};

},{"../is_continuation":10,"./convert_embedded_doc_to_response":20,"minilog":1}],20:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function convertEmbeddedDocToResponse(t) {
  if (!t.step.response && t.step.doc) {
    log.debug('faking HTTP response for embedded resource');
    t.step.response = {
      statusCode: 200,
      body: JSON.stringify(t.step.doc),
      remark: 'This is not an actual HTTP response. The resource you ' +
        'requested was an embedded resource, so no HTTP request was ' +
        'made to acquire it.'
    };
  }
  return true;
};

},{"minilog":1}],21:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

var mediaTypeRegistry = require('../media_type_registry');

module.exports = function detectContentType(t, callback) {
  if (t.contentNegotiation &&
      t.step.response &&
      t.step.response.headers &&
      t.step.response.headers['content-type']) {
    var contentType = t.step.response.headers['content-type'].split(/[; ]/)[0];
    var AdapterType = mediaTypeRegistry.get(contentType);
    if (!AdapterType) {
      callback(new Error('Unknown content type for content ' +
          'type detection: ' + contentType));
      return false;
    }
    // switch to new Adapter depending on Content-Type header of server
    t.adapter = new AdapterType(log);
  }
  return true;
};

},{"../media_type_registry":12,"minilog":1}],22:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , httpRequests = require('../http_requests');

/*
 * Execute the last HTTP request in a traversal that ends in
 * post/put/patch/delete, but do not call t.callback immediately
 * (because we still need to do response body to object conversion
 * afterwards, for example)
 */
// TODO Why is this different from when do a GET?
// Probably only because the HTTP method is configurable here (with
// t.lastMethod), we might be able to unify this with the
// fetch_resource/fetch_last_resource transform.
function executeLastHttpRequest(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  // only diff to execute_last_http_request: pass a new callback function
  // instead of t.callback.
  httpRequests.executeHttpRequest(
      t, t.requestModuleInstance, t.lastMethod, function(err, response) {
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', t.step);
        log.error(err);
      }
      return t.callback(err);
    }
    callback(t);
  });
}

executeLastHttpRequest.isAsync = true;

module.exports = executeLastHttpRequest;

},{"../abort_traversal":6,"../http_requests":9,"minilog":1}],23:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , httpRequests = require('../http_requests');

/*
 * Execute the last http request in a traversal that ends in
 * post/put/patch/delete.
 */
// TODO Why is this different from when do a GET at the end of the traversal?
// Probably only because the HTTP method is configurable here (with
// t.lastMethod), we might be able to unify this with the
// fetch_resource/fetch_last_resource transform.
function executeLastHttpRequest(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  httpRequests.executeHttpRequest(
      t, t.requestModuleInstance, t.lastMethod, t.callback);
}

executeLastHttpRequest.isAsync = true;

module.exports = executeLastHttpRequest;

},{"../abort_traversal":6,"../http_requests":9,"minilog":1}],24:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

/*
 * This transform is meant to be run at the very end of a getResource call. It
 * just extracts the last doc from the step and calls t.callback with it.
 */
module.exports = function extractDoc(t) {
  log.debug('walker.walk has finished');
  /*
  TODO Breaks a lot of tests although it seems to make perfect sense?!?
  if (!t.doc) {
    t.callback(new Error('No document available'));
    return false;
  }
  */

  t.callback(null, t.step.doc);

  // This is a so called final transform that is only applied at the very end
  // and it always calls t.callback - in contrast to other transforms it does
  // not call t.callback in the error case, but as a success.
  // We return false to make sure processing ends here.
  return false;
};

},{"minilog":1}],25:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

/*
 * This transform is meant to be run at the very end of a get/post/put/patch/
 * delete call. It just extracts the last response from the step and calls
 * t.callback with it.
 */
module.exports = function extractDoc(t) {
  log.debug('walker.walk has finished');
  /*
  TODO Breaks a lot of tests although it seems to make perfect sense?!?
  if (!t.response) {
    t.callback(new Error('No response available'));
    return false;
  }
  */

  t.callback(null, t.step.response);

  // This is a so called final transform that is only applied at the very end
  // and it always calls t.callback - in contrast to other transforms it does
  // not call t.callback in the error case, but as a success.
  // We return false to make sure processing ends here.
  return false;
};

},{"minilog":1}],26:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , url = require('url');

/*
 * This transform is meant to be run at the very end of a get/post/put/patch/
 * delete call. It just extracts the last accessed url from the step and calls
 * t.callback with it.
 */
module.exports = function extractDoc(t) {
  log.debug('walker.walk has finished');
  if (t.step.url) {
    return t.callback(null, t.step.url);
  } else if (t.step.doc &&
    // TODO actually this is very HAL specific :-/
    t.step.doc._links &&
    t.step.doc._links.self &&
    t.step.doc._links.self.href) {
    return t.callback(
        null, url.resolve(t.startUrl, t.step.doc._links.self.href));
  } else {
    return t.callback(new Error('You requested an URL but the last ' +
        'resource is an embedded resource and has no URL of its own ' +
        '(that is, it has no link with rel=\"self\"'));
  }
};

},{"minilog":1,"url":5}],27:[function(require,module,exports){
'use strict';

// TODO Only difference to lib/transform/fetch_resource is the continuation
// checking, which is missing here. Maybe we can delete this transform and use
// fetch_resource in its place everywhere?

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , httpRequests = require('../http_requests');

/*
 * Execute the last step in a traversal that ends with an HTTP GET.
 */
// This is similar to lib/transforms/fetch_resource.js - refactoring potential?
function fetchLastResource(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  httpRequests.fetchResource(t, function(err, t) {
    log.debug('fetchResource returned (fetchLastResource).');
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', t.step);
        log.error(err);
      }
      return t.callback(err);
    }
    callback(t);
  });
}

fetchLastResource.isAsync = true;

module.exports = fetchLastResource;

},{"../abort_traversal":6,"../http_requests":9,"minilog":1}],28:[function(require,module,exports){
(function (process){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , isContinuation = require('../is_continuation')
  , httpRequests = require('../http_requests');

/*
 * Execute the next step in the traversal. In most cases that is an HTTP get to
 *the next URL.
 */

function fetchResource(t, callback) {
  if (isContinuation(t)) {
    convertContinuation(t, callback);
  } else {
    fetchViaHttp(t, callback);
  }
}

fetchResource.isAsync = true;

/*
 * This is a continuation of an earlier traversal process.
 * We need to shortcut to the next step (without executing the final HTTP
 * request of the last traversal again.
 */
function convertContinuation(t, callback) {
  log.debug('continuing from last traversal process (walker)');
  process.nextTick(function() { // de-zalgo continuations
    callback(t);
  });
}

function fetchViaHttp(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  httpRequests.fetchResource(t, function(err, t) {
    log.debug('fetchResource returned');
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', t.step);
        log.error(err);
      }
      return t.callback(err);
    }
    callback(t);
  });
}

module.exports = fetchResource;

}).call(this,require('_process'))
},{"../abort_traversal":6,"../http_requests":9,"../is_continuation":10,"_process":45,"minilog":1}],29:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , util = require('util');

module.exports = function getOptionsForStep(t) {
  var options = t.requestOptions;
  if (util.isArray(t.requestOptions)) {
    options = t.requestOptions[t.step.index] || {};
  }
  log.debug('options: ', options);
  return options;
};

},{"minilog":1,"util":2}],30:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , isContinuation = require('../is_continuation');

module.exports = function parse(t) {
  // TODO Duplicated in actions#afterGetResource etc.
  // this step is ommitted for continuations that parse at the end
  if (isContinuation(t)) {
    log.debug('continuing from last traversal process (transforms/parse)');
    // if last traversal did a parse at the end we do not need to parse again
    // (this condition will need to change with
    // https://github.com/basti1302/traverson/issues/44)
    if (t.continuation.action === 'getResource') {
      return true;
    }
  }
  if (t.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('no parsing necessary, probably an embedded document');
    return true;
  }

  try {
    log.debug('parsing response body');
    t.step.doc = t.jsonParser(t.step.response.body);
    return true;
  } catch (e) {
    var error = e;
    if (e.name === 'SyntaxError') {
      error = jsonError(t.step.url, t.step.response.body);
    }
    log.error('parsing failed');
    log.error(error);
    t.callback(error);
    return false;
  }
};

function jsonError(url, body) {
  var error = new Error('The document at ' + url +
      ' could not be parsed as JSON: ' + body);
  error.name = 'JSONError';
  error.url = url;
  error.body = body;
  return error;
}

},{"../is_continuation":10,"minilog":1}],31:[function(require,module,exports){
'use strict';

var isContinuation = require('../is_continuation');

module.exports = function resetLastStep(t) {
  // this step is ommitted for continuations
  if (isContinuation(t)) {
    return true;
  }

  t.continuation = null;
  return true;
};

},{"../is_continuation":10}],32:[function(require,module,exports){
'use strict';

var isContinuation = require('../is_continuation');

module.exports = function resetLastStep(t) {
  // this step is ommitted for continuations
  if (isContinuation(t)) {
    return true;
  }

  t.lastStep = null;
  return true;
};

},{"../is_continuation":10}],33:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , _s = require('underscore.string')
  , url = require('url');

var protocolRegEx = /https?:\/\//i;

module.exports = function resolveNextUrl(t) {
  if (t.step.url) {
    if (t.step.url.search(protocolRegEx) !== 0) {
      log.debug('found non full qualified URL');
      if (t.resolveRelative && t.lastStep && t.lastStep.url) {
        // edge case: resolve URL relatively (only when requested by client)
        log.debug('resolving URL relative');
        if (_s.startsWith(t.step.url, '/') &&
          _s.endsWith(t.lastStep.url, '/')) {
          t.step.url = _s.splice(t.step.url, 0, 1);
        }
        t.step.url = t.lastStep.url + t.step.url;
      } else {
        // This is the default case and what happens most likely (not a full
        // qualified URL, not resolving relatively) and we simply use Node's url
        // module (or the appropriate shim) here.
        t.step.url = url.resolve(t.startUrl, t.step.url);
      }
    } // edge case: full qualified URL -> no URL resolving necessary
  } // no t.step.url -> no URL resolving (step might contain an embedded doc)
  return true;
};

},{"minilog":1,"underscore.string":4,"url":5}],34:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , _s = require('underscore.string')
  , uriTemplate = require('url-template')
  , util = require('util');

module.exports = function resolveUriTemplate(t) {
  if (t.step.url) {
    // next link found in last response, might be a URI template
    var templateParams = t.templateParameters;
    if (util.isArray(templateParams)) {
      // if template params were given as an array, only use the array element
      // for the current index for URI template resolving.
      templateParams = templateParams[t.step.index];
    }
    templateParams = templateParams || {};

    if (_s.contains(t.step.url, '{')) {
      log.debug('resolving URI template');
      var template = uriTemplate.parse(t.step.url);
      var resolved = template.expand(templateParams);
      log.debug('resolved to ', resolved);
      t.step.url = resolved;
    }
  }
  return true;
};



},{"minilog":1,"underscore.string":4,"url-template":52,"util":2}],35:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function switchToNextStep(t) {
  // extract next link to follow from last response
  var link = t.links[t.step.index];
  log.debug('next link: ' + link);

  // save last step before overwriting it with the next step (required for
  // relative URL resolution, where we need the last URL)
  t.lastStep = t.step;

  t.step = findNextStep(t, link);
  if (!t.step) return false;

  log.debug('found next step', t.step);

  // backward compatibility fix for media type plug-ins using step.uri instead
  // of step.url (until 1.0.0)
  t.step.url = t.step.url || t.step.uri;

  t.step.index = t.lastStep.index + 1;
  return true;
};

function findNextStep(t, link) {
  try {
    return t.adapter.findNextStep(t, link);
  } catch (e) {
    log.error('could not find next step');
    log.error(e);
    t.callback(e);
    return null;
  }
}

},{"minilog":1}],36:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , applyTransforms = require('./transforms/apply_transforms')
  , isContinuation = require('./is_continuation')
  , resolveUriTemplate = require('./transforms/resolve_uri_template');

var transforms = [
  require('./transforms/fetch_resource'),
  require('./transforms/reset_last_step'),
  // check HTTP status code
  require('./transforms/check_http_status'),
  // parse JSON from last response
  require('./transforms/parse'),
  // retrieve next link and switch to next step
  require('./transforms/switch_to_next_step'),
  // URI template has to be resolved before post processing the URL,
  // because we do url.resolve with it (in json_hal) and this would URL-
  // encode curly braces.
  resolveUriTemplate,
  require('./transforms/resolve_next_url'),
  require('./transforms/reset_continuation'),
];

/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URL. On reaching this, it calls
 * the given callback with the last resulting step.
 */
exports.walk = function(t, transformsAfterLastStep, callback) {
  // even the root URL might be a template, so we apply the resolveUriTemplate
  // once before starting the walk.
  if (!resolveUriTemplate(t)) return;

  // starts the link rel walking process
  log.debug('starting to follow links');
  transformsAfterLastStep = transformsAfterLastStep || [];
  t.callback = callback;
  processStep(t, transformsAfterLastStep);
};

function processStep(t, transformsAfterLastStep) {
  log.debug('processing next step');
  if (moreLinksToFollow(t) && !isAborted(t)) {
    applyTransforms(transforms, t, function(t) {
      log.debug('successfully processed step');
      // call processStep recursively again to follow next link
      processStep(t, transformsAfterLastStep);
    });
  } else if (isAborted(t)) {
    return abortTraversal.callCallbackOnAbort(t);
  } else {
    // link array is exhausted, we are done and return the last response
    // and URL to the callback the client passed into the walk method.
    log.debug('link array exhausted');

    applyTransforms(transformsAfterLastStep, t, function(t) {
      // This is pretty ugly. This code implies, that we call t.callback from
      // here, but actually we usually call it from lib/transforms/extract_doc
      // or lib/transforms/extract_response which then return false to terminate
      // the processing.
      return t.callback();
    });
  }
}

function moreLinksToFollow(t) {
  return t.step.index < t.links.length;
}

function isAborted(t) {
  return t.aborted;
}

},{"./abort_traversal":6,"./is_continuation":10,"./transforms/apply_transforms":16,"./transforms/check_http_status":17,"./transforms/fetch_resource":28,"./transforms/parse":30,"./transforms/reset_continuation":31,"./transforms/reset_last_step":32,"./transforms/resolve_next_url":33,"./transforms/resolve_uri_template":34,"./transforms/switch_to_next_step":35,"minilog":1}],37:[function(require,module,exports){
'use strict'

exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

function init () {
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }

  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63
}

init()

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],38:[function(require,module,exports){
(function (Buffer){
(function () {
  "use strict";

  function btoa(str) {
    var buffer
      ;

    if (str instanceof Buffer) {
      buffer = str;
    } else {
      buffer = new Buffer(str.toString(), 'binary');
    }

    return buffer.toString('base64');
  }

  module.exports = btoa;
}());

}).call(this,require("buffer").Buffer)
},{"buffer":39}],39:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; i++) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  that.write(string, encoding)
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

function arrayIndexOf (arr, val, byteOffset, encoding) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var foundIndex = -1
  for (var i = 0; byteOffset + i < arrLength; i++) {
    if (read(arr, byteOffset + i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
      if (foundIndex === -1) foundIndex = i
      if (i - foundIndex + 1 === valLength) return (byteOffset + foundIndex) * indexSize
    } else {
      if (foundIndex !== -1) i -= i - foundIndex
      foundIndex = -1
    }
  }
  return -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  if (Buffer.isBuffer(val)) {
    // special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(this, val, byteOffset, encoding)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset, encoding)
  }

  throw new TypeError('val must be string, number or Buffer')
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; i++) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; i++) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":37,"ieee754":41,"isarray":43}],40:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],41:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],42:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],43:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],44:[function(require,module,exports){
/*global exports, require*/
/* eslint-disable no-eval */
/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

var module;
(function (glbl, require) {'use strict';

// Make sure to know if we are in real node or not (the `require` variable
// could actually be require.js, for example.
var isNode = module && !!module.exports;

var allowedResultTypes = ['value', 'path', 'pointer', 'parent', 'parentProperty', 'all'];

var moveToAnotherArray = function (source, target, conditionCb) {
  for (var i = 0, kl = source.length; i < kl; i++) {
      var key = source[i];
      if (conditionCb(key)) {
          target.push(source.splice(i--, 1)[0]);
      }
  }
};

var vm = isNode
    ? require('vm') : {
        runInNewContext: function (expr, context) {
            var keys = Object.keys(context);
            var funcs = [];
            moveToAnotherArray(keys, funcs, function (key) {
                return typeof context[key] === 'function';
            });
            var code = funcs.reduce(function (s, func) {
                return 'var ' + func + '=' + context[func].toString() + ';' + s;
            }, '');
            code += keys.reduce(function (s, vr) {
                return 'var ' + vr + '=' + JSON.stringify(context[vr]).replace(/\u2028|\u2029/g, function (m) {
                    // http://www.thespanner.co.uk/2011/07/25/the-json-specification-is-now-wrong/
                    return '\\u202' + (m === '\u2028' ? '8' : '9');
                }) + ';' + s;
            }, expr);
            return eval(code);
        }
    };

function push (arr, elem) {arr = arr.slice(); arr.push(elem); return arr;}
function unshift (elem, arr) {arr = arr.slice(); arr.unshift(elem); return arr;}
function NewError (value) {
  this.avoidNew = true;
  this.value = value;
  this.message = 'JSONPath should not be called with "new" (it prevents return of (unwrapped) scalar values)';
}

function JSONPath (opts, expr, obj, callback, otherTypeCallback) {
    if (!(this instanceof JSONPath)) {
        try {
            return new JSONPath(opts, expr, obj, callback, otherTypeCallback);
        }
        catch (e) {
            if (!e.avoidNew) {
                throw e;
            }
            return e.value;
        }
    }

    if (typeof opts === 'string') {
        otherTypeCallback = callback;
        callback = obj;
        obj = expr;
        expr = opts;
        opts = {};
    }
    opts = opts || {};
    var objArgs = opts.hasOwnProperty('json') && opts.hasOwnProperty('path');
    this.json = opts.json || obj;
    this.path = opts.path || expr;
    this.resultType = (opts.resultType && opts.resultType.toLowerCase()) || 'value';
    this.flatten = opts.flatten || false;
    this.wrap = opts.hasOwnProperty('wrap') ? opts.wrap : true;
    this.sandbox = opts.sandbox || {};
    this.preventEval = opts.preventEval || false;
    this.parent = opts.parent || null;
    this.parentProperty = opts.parentProperty || null;
    this.callback = opts.callback || callback || null;
    this.otherTypeCallback = opts.otherTypeCallback || otherTypeCallback || function () {
        throw new Error('You must supply an otherTypeCallback callback option with the @other() operator.');
    };

    if (opts.autostart !== false) {
        var ret = this.evaluate({
            path: (objArgs ? opts.path : expr),
            json: (objArgs ? opts.json : obj)
        });
        if (!ret || typeof ret !== 'object') {
            throw new NewError(ret);
        }
        return ret;
    }
}

// PUBLIC METHODS

JSONPath.prototype.evaluate = function (expr, json, callback, otherTypeCallback) {
    var self = this,
        flatten = this.flatten,
        wrap = this.wrap,
        currParent = this.parent,
        currParentProperty = this.parentProperty;

    this.currResultType = this.resultType;
    this.currPreventEval = this.preventEval;
    this.currSandbox = this.sandbox;
    callback = callback || this.callback;
    this.currOtherTypeCallback = otherTypeCallback || this.otherTypeCallback;

    json = json || this.json;
    expr = expr || this.path;
    if (expr && typeof expr === 'object') {
        if (!expr.path) {
            throw new Error('You must supply a "path" property when providing an object argument to JSONPath.evaluate().');
        }
        json = expr.hasOwnProperty('json') ? expr.json : json;
        flatten = expr.hasOwnProperty('flatten') ? expr.flatten : flatten;
        this.currResultType = expr.hasOwnProperty('resultType') ? expr.resultType : this.currResultType;
        this.currSandbox = expr.hasOwnProperty('sandbox') ? expr.sandbox : this.currSandbox;
        wrap = expr.hasOwnProperty('wrap') ? expr.wrap : wrap;
        this.currPreventEval = expr.hasOwnProperty('preventEval') ? expr.preventEval : this.currPreventEval;
        callback = expr.hasOwnProperty('callback') ? expr.callback : callback;
        this.currOtherTypeCallback = expr.hasOwnProperty('otherTypeCallback') ? expr.otherTypeCallback : this.currOtherTypeCallback;
        currParent = expr.hasOwnProperty('parent') ? expr.parent : currParent;
        currParentProperty = expr.hasOwnProperty('parentProperty') ? expr.parentProperty : currParentProperty;
        expr = expr.path;
    }
    currParent = currParent || null;
    currParentProperty = currParentProperty || null;

    if (Array.isArray(expr)) {
        expr = JSONPath.toPathString(expr);
    }
    if (!expr || !json || allowedResultTypes.indexOf(this.currResultType) === -1) {
        return;
    }
    this._obj = json;

    var exprList = JSONPath.toPathArray(expr);
    if (exprList[0] === '$' && exprList.length > 1) {exprList.shift();}
    var result = this._trace(exprList, json, ['$'], currParent, currParentProperty, callback);
    result = result.filter(function (ea) {return ea && !ea.isParentSelector;});

    if (!result.length) {return wrap ? [] : undefined;}
    if (result.length === 1 && !wrap && !Array.isArray(result[0].value)) {
        return this._getPreferredOutput(result[0]);
    }
    return result.reduce(function (result, ea) {
        var valOrPath = self._getPreferredOutput(ea);
        if (flatten && Array.isArray(valOrPath)) {
            result = result.concat(valOrPath);
        }
        else {
            result.push(valOrPath);
        }
        return result;
    }, []);
};

// PRIVATE METHODS

JSONPath.prototype._getPreferredOutput = function (ea) {
    var resultType = this.currResultType;
    switch (resultType) {
    case 'all':
        ea.path = typeof ea.path === 'string' ? ea.path : JSONPath.toPathString(ea.path);
        return ea;
    case 'value': case 'parent': case 'parentProperty':
        return ea[resultType];
    case 'path':
        return JSONPath.toPathString(ea[resultType]);
    case 'pointer':
        return JSONPath.toPointer(ea.path);
    }
};

JSONPath.prototype._handleCallback = function (fullRetObj, callback, type) {
    if (callback) {
        var preferredOutput = this._getPreferredOutput(fullRetObj);
        fullRetObj.path = typeof fullRetObj.path === 'string' ? fullRetObj.path : JSONPath.toPathString(fullRetObj.path);
        callback(preferredOutput, type, fullRetObj);
    }
};

JSONPath.prototype._trace = function (expr, val, path, parent, parentPropName, callback) {
    // No expr to follow? return path and value as the result of this trace branch
    var retObj, self = this;
    if (!expr.length) {
        retObj = {path: path, value: val, parent: parent, parentProperty: parentPropName};
        this._handleCallback(retObj, callback, 'value');
        return retObj;
    }

    var loc = expr[0], x = expr.slice(1);

    // We need to gather the return value of recursive trace calls in order to
    // do the parent sel computation.
    var ret = [];
    function addRet (elems) {ret = ret.concat(elems);}

    if (val && Object.prototype.hasOwnProperty.call(val, loc)) { // simple case--directly follow property
        addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback));
    }
    else if (loc === '*') { // all child properties
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            addRet(self._trace(unshift(m, x), v, p, par, pr, cb));
        });
    }
    else if (loc === '..') { // all descendent parent properties
        addRet(this._trace(x, val, path, parent, parentPropName, callback)); // Check remaining expression with val's immediate children
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            // We don't join m and x here because we only want parents, not scalar values
            if (typeof v[m] === 'object') { // Keep going with recursive descent on val's object children
                addRet(self._trace(unshift(l, x), v[m], push(p, m), v, m, cb));
            }
        });
    }
    else if (loc[0] === '(') { // [(expr)] (dynamic property/index)
        if (this.currPreventEval) {
            throw new Error('Eval [(expr)] prevented in JSONPath expression.');
        }
        // As this will resolve to a property name (but we don't know it yet), property and parent information is relative to the parent of the property to which this expression will resolve
        addRet(this._trace(unshift(this._eval(loc, val, path[path.length - 1], path.slice(0, -1), parent, parentPropName), x), val, path, parent, parentPropName, callback));
    }
    // The parent sel computation is handled in the frame above using the
    // ancestor object of val
    else if (loc === '^') {
        // This is not a final endpoint, so we do not invoke the callback here
        return path.length ? {
            path: path.slice(0, -1),
            expr: x,
            isParentSelector: true
        } : [];
    }
    else if (loc === '~') { // property name
        retObj = {path: push(path, loc), value: parentPropName, parent: parent, parentProperty: null};
        this._handleCallback(retObj, callback, 'property');
        return retObj;
    }
    else if (loc === '$') { // root only
        addRet(this._trace(x, val, path, null, null, callback));
    }
    else if (loc.indexOf('?(') === 0) { // [?(expr)] (filtering)
        if (this.currPreventEval) {
            throw new Error('Eval [?(expr)] prevented in JSONPath expression.');
        }
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            if (self._eval(l.replace(/^\?\((.*?)\)$/, '$1'), v[m], m, p, par, pr)) {
                addRet(self._trace(unshift(m, x), v, p, par, pr, cb));
            }
        });
    }
    else if (loc.indexOf(',') > -1) { // [name1,name2,...]
        var parts, i;
        for (parts = loc.split(','), i = 0; i < parts.length; i++) {
            addRet(this._trace(unshift(parts[i], x), val, path, parent, parentPropName, callback));
        }
    }
    else if (loc[0] === '@') { // value type: @boolean(), etc.
        var addType = false;
        var valueType = loc.slice(1, -2);
        switch (valueType) {
        case 'scalar':
            if (!val || (['object', 'function'].indexOf(typeof val) === -1)) {
                addType = true;
            }
            break;
        case 'boolean': case 'string': case 'undefined': case 'function':
            if (typeof val === valueType) {
                addType = true;
            }
            break;
        case 'number':
            if (typeof val === valueType && isFinite(val)) {
                addType = true;
            }
            break;
        case 'nonFinite':
            if (typeof val === 'number' && !isFinite(val)) {
                addType = true;
            }
            break;
        case 'object':
            if (val && typeof val === valueType) {
                addType = true;
            }
            break;
        case 'array':
            if (Array.isArray(val)) {
                addType = true;
            }
            break;
        case 'other':
            addType = this.currOtherTypeCallback(val, path, parent, parentPropName);
            break;
        case 'integer':
            if (val === +val && isFinite(val) && !(val % 1)) {
                addType = true;
            }
            break;
        case 'null':
            if (val === null) {
                addType = true;
            }
            break;
        }
        if (addType) {
            retObj = {path: path, value: val, parent: parent, parentProperty: parentPropName};
            this._handleCallback(retObj, callback, 'value');
            return retObj;
        }
    }
    else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) { // [start:end:step]  Python slice syntax
        addRet(this._slice(loc, x, val, path, parent, parentPropName, callback));
    }

    // We check the resulting values for parent selections. For parent
    // selections we discard the value object and continue the trace with the
    // current val object
    return ret.reduce(function (all, ea) {
        return all.concat(ea.isParentSelector ? self._trace(ea.expr, val, ea.path, parent, parentPropName, callback) : ea);
    }, []);
};

JSONPath.prototype._walk = function (loc, expr, val, path, parent, parentPropName, callback, f) {
    var i, n, m;
    if (Array.isArray(val)) {
        for (i = 0, n = val.length; i < n; i++) {
            f(i, loc, expr, val, path, parent, parentPropName, callback);
        }
    }
    else if (typeof val === 'object') {
        for (m in val) {
            if (Object.prototype.hasOwnProperty.call(val, m)) {
                f(m, loc, expr, val, path, parent, parentPropName, callback);
            }
        }
    }
};

JSONPath.prototype._slice = function (loc, expr, val, path, parent, parentPropName, callback) {
    if (!Array.isArray(val)) {return;}
    var i,
        len = val.length, parts = loc.split(':'),
        start = (parts[0] && parseInt(parts[0], 10)) || 0,
        end = (parts[1] && parseInt(parts[1], 10)) || len,
        step = (parts[2] && parseInt(parts[2], 10)) || 1;
    start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
    end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
    var ret = [];
    for (i = start; i < end; i += step) {
        ret = ret.concat(this._trace(unshift(i, expr), val, path, parent, parentPropName, callback));
    }
    return ret;
};

JSONPath.prototype._eval = function (code, _v, _vname, path, parent, parentPropName) {
    if (!this._obj || !_v) {return false;}
    if (code.indexOf('@parentProperty') > -1) {
        this.currSandbox._$_parentProperty = parentPropName;
        code = code.replace(/@parentProperty/g, '_$_parentProperty');
    }
    if (code.indexOf('@parent') > -1) {
        this.currSandbox._$_parent = parent;
        code = code.replace(/@parent/g, '_$_parent');
    }
    if (code.indexOf('@property') > -1) {
        this.currSandbox._$_property = _vname;
        code = code.replace(/@property/g, '_$_property');
    }
    if (code.indexOf('@path') > -1) {
        this.currSandbox._$_path = JSONPath.toPathString(path.concat([_vname]));
        code = code.replace(/@path/g, '_$_path');
    }
    if (code.match(/@([\.\s\)\[])/)) {
        this.currSandbox._$_v = _v;
        code = code.replace(/@([\.\s\)\[])/g, '_$_v$1');
    }
    try {
        return vm.runInNewContext(code, this.currSandbox);
    }
    catch (e) {
        console.log(e);
        throw new Error('jsonPath: ' + e.message + ': ' + code);
    }
};

// PUBLIC CLASS PROPERTIES AND METHODS

// Could store the cache object itself
JSONPath.cache = {};

JSONPath.toPathString = function (pathArr) {
    var i, n, x = pathArr, p = '$';
    for (i = 1, n = x.length; i < n; i++) {
        if (!(/^(~|\^|@.*?\(\))$/).test(x[i])) {
            p += (/^[0-9*]+$/).test(x[i]) ? ('[' + x[i] + ']') : ("['" + x[i] + "']");
        }
    }
    return p;
};

JSONPath.toPointer = function (pointer) {
    var i, n, x = pointer, p = '';
    for (i = 1, n = x.length; i < n; i++) {
        if (!(/^(~|\^|@.*?\(\))$/).test(x[i])) {
            p += '/' + x[i].toString()
                  .replace(/\~/g, '~0')
                  .replace(/\//g, '~1');
        }
    }
    return p;
};

JSONPath.toPathArray = function (expr) {
    var cache = JSONPath.cache;
    if (cache[expr]) {return cache[expr];}
    var subx = [];
    var normalized = expr
                    // Properties
                    .replace(/@(?:null|boolean|number|string|integer|undefined|nonFinite|scalar|array|object|function|other)\(\)/g, ';$&;')
                    // Parenthetical evaluations (filtering and otherwise), directly within brackets or single quotes
                    .replace(/[\['](\??\(.*?\))[\]']/g, function ($0, $1) {return '[#' + (subx.push($1) - 1) + ']';})
                    // Escape periods and tildes within properties
                    .replace(/\['([^'\]]*)'\]/g, function ($0, prop) {
                        return "['" + prop.replace(/\./g, '%@%').replace(/~/g, '%%@@%%') + "']";
                    })
                    // Properties operator
                    .replace(/~/g, ';~;')
                    // Split by property boundaries
                    .replace(/'?\.'?(?![^\[]*\])|\['?/g, ';')
                    // Reinsert periods within properties
                    .replace(/%@%/g, '.')
                    // Reinsert tildes within properties
                    .replace(/%%@@%%/g, '~')
                    // Parent
                    .replace(/(?:;)?(\^+)(?:;)?/g, function ($0, ups) {return ';' + ups.split('').join(';') + ';';})
                    // Descendents
                    .replace(/;;;|;;/g, ';..;')
                    // Remove trailing
                    .replace(/;$|'?\]|'$/g, '');

    var exprList = normalized.split(';').map(function (expr) {
        var match = expr.match(/#([0-9]+)/);
        return !match || !match[1] ? expr : subx[match[1]];
    });
    cache[expr] = exprList;
    return cache[expr];
};

// For backward compatibility (deprecated)
JSONPath.eval = function (obj, expr, opts) {
    return JSONPath(opts, expr, obj);
};

if (typeof define === 'function' && define.amd) {
    define(function () {return JSONPath;});
}
else if (isNode) {
    module.exports = JSONPath;
}
else {
    glbl.jsonPath = { // Deprecated
        eval: JSONPath.eval
    };
    glbl.JSONPath = JSONPath;
}
}(this || self, typeof require === 'undefined' ? null : require));

},{"vm":53}],45:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],46:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],47:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],48:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');
var requestBase = require('./request-base');
var isObject = require('./is-object');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Expose `request`.
 */

var request = module.exports = require('./request').bind(null, Request);

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      // issue #876: return the http status code if the response parsing fails
      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter` and `requestBase`.
 */

Emitter(Request.prototype);
for (var key in requestBase) {
  Request.prototype[key] = requestBase[key];
}

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set responseType to `val`. Presently valid responseTypes are 'blob' and 
 * 'arraybuffer'.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (!options) {
    options = {
      type: 'basic'
    }
  }

  switch (options.type) {
    case 'basic':
      var str = btoa(user + ':' + pass);
      this.set('Authorization', 'Basic ' + str);
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
  }
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  this._getFormData().append(field, file, filename || file.name);
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this._header['content-type'];

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * @deprecated
 */
Response.prototype.parse = function serialize(fn){
  if (root.console) {
    console.warn("Client-side parse() method has been renamed to serialize(). This method is not compatible with superagent v2.0");
  }
  this.serialize(fn);
  return this;
};

Response.prototype.serialize = function serialize(fn){
  this._parser = fn;
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = 'download';
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  if (this.username && this.password) {
    xhr.open(this.method, this.url, true, this.username, this.password);
  } else {
    xhr.open(this.method, this.url, true);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};


/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-object":49,"./request":51,"./request-base":50,"emitter":40,"reduce":46}],49:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null != obj && 'object' == typeof obj;
}

module.exports = isObject;

},{}],50:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

exports.clearTimeout = function _clearTimeout(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

exports.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

exports.timeout = function timeout(ms){
  this._timeout = ms;
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

exports.then = function then(fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Allow for extension
 */

exports.use = function use(fn) {
  fn(this);
  return this;
}


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

exports.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

exports.getHeader = exports.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

exports.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
exports.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
exports.field = function(name, val) {
  this._getFormData().append(name, val);
  return this;
};

},{"./is-object":49}],51:[function(require,module,exports){
// The node and browser modules expose versions of this with the
// appropriate constructor function bound as first argument
/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(RequestConstructor, method, url) {
  // callback
  if ('function' == typeof url) {
    return new RequestConstructor('GET', method).end(url);
  }

  // url first
  if (2 == arguments.length) {
    return new RequestConstructor('GET', method);
  }

  return new RequestConstructor(method, url);
}

module.exports = request;

},{}],52:[function(require,module,exports){
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.urltemplate = factory();
    }
}(this, function () {
  /**
   * @constructor
   */
  function UrlTemplate() {
  }

  /**
   * @private
   * @param {string} str
   * @return {string}
   */
  UrlTemplate.prototype.encodeReserved = function (str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
      if (!/%[0-9A-Fa-f]/.test(part)) {
        part = encodeURI(part).replace(/%5B/g, '[').replace(/%5D/g, ']');
      }
      return part;
    }).join('');
  };

  /**
   * @private
   * @param {string} str
   * @return {string}
   */
  UrlTemplate.prototype.encodeUnreserved = function (str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  /**
   * @private
   * @param {string} operator
   * @param {string} value
   * @param {string} key
   * @return {string}
   */
  UrlTemplate.prototype.encodeValue = function (operator, value, key) {
    value = (operator === '+' || operator === '#') ? this.encodeReserved(value) : this.encodeUnreserved(value);

    if (key) {
      return this.encodeUnreserved(key) + '=' + value;
    } else {
      return value;
    }
  };

  /**
   * @private
   * @param {*} value
   * @return {boolean}
   */
  UrlTemplate.prototype.isDefined = function (value) {
    return value !== undefined && value !== null;
  };

  /**
   * @private
   * @param {string}
   * @return {boolean}
   */
  UrlTemplate.prototype.isKeyOperator = function (operator) {
    return operator === ';' || operator === '&' || operator === '?';
  };

  /**
   * @private
   * @param {Object} context
   * @param {string} operator
   * @param {string} key
   * @param {string} modifier
   */
  UrlTemplate.prototype.getValues = function (context, operator, key, modifier) {
    var value = context[key],
        result = [];

    if (this.isDefined(value) && value !== '') {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        value = value.toString();

        if (modifier && modifier !== '*') {
          value = value.substring(0, parseInt(modifier, 10));
        }

        result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
      } else {
        if (modifier === '*') {
          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                result.push(this.encodeValue(operator, value[k], k));
              }
            }, this);
          }
        } else {
          var tmp = [];

          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              tmp.push(this.encodeValue(operator, value));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                tmp.push(this.encodeUnreserved(k));
                tmp.push(this.encodeValue(operator, value[k].toString()));
              }
            }, this);
          }

          if (this.isKeyOperator(operator)) {
            result.push(this.encodeUnreserved(key) + '=' + tmp.join(','));
          } else if (tmp.length !== 0) {
            result.push(tmp.join(','));
          }
        }
      }
    } else {
      if (operator === ';') {
        result.push(this.encodeUnreserved(key));
      } else if (value === '' && (operator === '&' || operator === '?')) {
        result.push(this.encodeUnreserved(key) + '=');
      } else if (value === '') {
        result.push('');
      }
    }
    return result;
  };

  /**
   * @param {string} template
   * @return {function(Object):string}
   */
  UrlTemplate.prototype.parse = function (template) {
    var that = this;
    var operators = ['+', '#', '.', '/', ';', '?', '&'];

    return {
      expand: function (context) {
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
          if (expression) {
            var operator = null,
                values = [];

            if (operators.indexOf(expression.charAt(0)) !== -1) {
              operator = expression.charAt(0);
              expression = expression.substr(1);
            }

            expression.split(/,/g).forEach(function (variable) {
              var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
              values.push.apply(values, that.getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
            });

            if (operator && operator !== '+') {
              var separator = ',';

              if (operator === '?') {
                separator = '&';
              } else if (operator !== '#') {
                separator = operator;
              }
              return (values.length !== 0 ? operator : '') + values.join(separator);
            } else {
              return values.join(',');
            }
          } else {
            return that.encodeReserved(literal);
          }
        });
      }
    };
  };

  return new UrlTemplate();
}));

},{}],53:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":42}],54:[function(require,module,exports){
/*
Step: HTTP Basic Authentication
POST https://api-sandbox.slimpay.net/oauth/token

Accept: application/hal+json; profile="https://api.slimpay.net/alps/v1"
Authorization: Basic Base64(hbih9vahrbk5a:zjMzjc5HhdOtK#Rpo3dub2YfQQZ6)
  Content-Type: application/x-www-form-urlencoded

  grant_type=client_credentials&scope=api

equivalent in curl:
curl -u "democreditor01:demosecret01" \
-d "grant_type=client_credentials&scope=api" \
https://api-sandbox.slimpay.net/oauth/token
*/

'use strict';

const traverson = require('../traverson');
let btoa_ = null;
if (typeof btoa === 'function') {
  btoa_ = btoa
} else {
  btoa_ = require('btoa');
}

const api = traverson.from('https://api-sandbox.slimpay.net/oauth/token');
const auth = 'Basic ' + btoa_('democreditor01:demosecret01');

api
.newRequest()
.withRequestOptions({
  /*
  headers: {
    'Authorization': auth,
  },
  form: {
    'grant_type': 'client_credentials',
    'scope': 'api'
  }
  */
  headers: {
    'Authorization': auth,
    'content-type': 'application/x-www-form-urlencoded',
  },
  qs: {
    'grant_type': 'client_credentials',
    'scope': 'api'
  }

})
.post(null,function(err, response, traversal){
  console.log(err);
  console.log(response.statusCode);
  console.log(response.statusMessage);
  console.log(response.body);
});

},{"../traverson":55,"btoa":38}],55:[function(require,module,exports){
(function (process){
'use strict';

var minilog = require('minilog')
  , mediaTypes = require('./lib/media_types')
  , Builder = require('./lib/builder')
  , mediaTypes = require('./lib/media_types')
  , mediaTypeRegistry = require('./lib/media_type_registry');

// activate this line to enable logging
if (process.env.TRAVERSON_LOGGING) {
  require('minilog').enable();
}

// export builder for traverson-angular
exports._Builder = Builder;

/**
 * Creates a new request builder instance.
 */
exports.newRequest = function newRequest() {
  return new Builder();
};

/**
 * Creates a new request builder instance with the given root URL.
 */
exports.from = function from(url) {
  var builder = new Builder();
  builder.from(url);
  return builder;
};

// Provided for backward compatibility with pre-1.0.0 versions.
// The preferred way is to use newRequest() or from() to create a request
// builder and either set the media type explicitly by calling json() on the
// request builder instance - or use content negotiation.
exports.json = {
  from: function(url) {
    var builder = new Builder();
    builder.from(url);
    builder.setMediaType(mediaTypes.JSON);
    return builder;
  }
},

// Provided for backward compatibility with pre-1.0.0 versions.
// The preferred way is to use newRequest() or from() to create a request
// builder and then either set the media type explicitly by calling jsonHal() on
// the request builder instance - or use content negotiation.
exports.jsonHal = {
  from: function(url) {
    if (!mediaTypeRegistry.get(mediaTypes.JSON_HAL)) {
      throw new Error('JSON HAL adapter is not registered. From version ' +
        '1.0.0 on, Traverson has no longer built-in support for ' +
        'application/hal+json. HAL support was moved to a separate, optional ' +
        'plug-in. See https://github.com/basti1302/traverson-hal');
    }
    var builder = new Builder();
    builder.from(url);
    builder.setMediaType(mediaTypes.JSON_HAL);
    return builder;
  }
};

// expose media type registry so that media type plug-ins can register
// themselves
exports.registerMediaType = mediaTypeRegistry.register;

// export media type constants
exports.mediaTypes = mediaTypes;

}).call(this,require('_process'))
},{"./lib/builder":8,"./lib/media_type_registry":12,"./lib/media_types":13,"_process":45,"minilog":1}]},{},[54]);
