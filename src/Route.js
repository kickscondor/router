import { parseRoute } from "./parseRoute"

export function Route(props) {
  return function(state, actions) {
    var location = state.location
    var match = parseRoute(props.path, location.pathname, {
      hashRouting: location.hashRouting,
      exact: !props.parent
    })

    if (match) {
      let setup = !location.rendered
      location.rendered = true
      return props.render({match, location, setup})
    }
  }
}
