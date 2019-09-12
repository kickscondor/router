function wrapHistory(keys) {
  return keys.reduce(function(next, key) {
    var fn = history[key]

    history[key] = function(data, title, url) {
      fn.call(this, data, title, url)
      dispatchEvent(new CustomEvent("pushstate", { detail: data }))
    }

    return function() {
      history[key] = fn
      next && next()
    }
  }, null)
}

function windowPathname(state) {
  return state.hashRouting ?
    (window.location.hash.substring(2) || "/") : window.location.pathname
}

export function location(opts) {
  opts = opts || {}
  let pathname = windowPathname(opts)
  return {
    state: {
      pathname,
      previous: pathname,
      rendered: false,
      hashRouting: false,
      ...opts
    },
    actions: {
      go: function(pathname) {
        if (!opts.hashRouting)
          history.pushState(null, "", pathname)
        else
          window.location = "#!" + pathname
      },
      set: function(data) {
        return data
      }
    },
    subscribe: function(actions) {
      function handleLocationChange(e) {
        let pathname = windowPathname(opts)
        actions.set({
          pathname,
          previous: e.detail
            ? (window.location.previous = e.detail)
            : window.location.previous,
          rendered: false
        })
      }

      var unwrap
      if (opts.hashRouting) {
        addEventListener("hashchange", handleLocationChange)
      } else {
        unwrap = wrapHistory(["pushState", "replaceState"])
        addEventListener("pushstate", handleLocationChange)
        addEventListener("popstate", handleLocationChange)
      }

      return function() {
        if (state.hashRouting) {
          removeEventListener("hashchange", handleLocationChange)
        } else {
          removeEventListener("pushstate", handleLocationChange)
          removeEventListener("popstate", handleLocationChange)
          unwrap()
        }
      }
    }
  }
}
