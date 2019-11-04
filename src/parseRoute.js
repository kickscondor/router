function trimTrailingSlash(url) {
  for (var len = url.length; "/" === url[--len]; );
  return url.slice(0, len + 1)
}

function decodeParam(val) {
  try {
    return decodeURIComponent(val)
  } catch (e) {
    return val
  }
}

function createMatch(isExact, path, url, params, query) {
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (pair[0])
      params[decodeParam(pair[0])] = decodeParam(pair[1])
  }
  
  return {
    isExact: isExact,
    path: path,
    url: url,
    params: params
  }
}

export function parseRoute(path, url, options) {
  var query = ""
  if (window.location.search)
    query = window.location.search.substring(1)
  if (options.hashRouting) {
    var qid = url.indexOf("?")
    if (qid >= 0) {
      query = url.substring(qid + 1)
      url = url.substring(0, qid)
    }
  }

  if (path === url || !path) {
    return createMatch(path === url, path, url, {}, query)
  }

  var exact = options && options.exact
  var paths = trimTrailingSlash(path).split("/")
  var urls = trimTrailingSlash(url).split("/")

  if (paths.length > urls.length || (exact && paths.length < urls.length)) {
    return
  }

  for (var i = 0, params = {}, len = paths.length, url = ""; i < len; i++) {
    if (":" === paths[i][0]) {
      params[paths[i].slice(1)] = urls[i] = decodeParam(urls[i])
    } else if (paths[i] !== urls[i]) {
      return
    }
    url += urls[i] + "/"
  }

  return createMatch(false, path, url.slice(0, -1), params, query)
}
