import {EmbeddedScene, SceneFlexLayout} from '@grafana/scenes';
import {getHelloWordComponentScene} from "./components/HelloWorldState";


export function getHelloWorldScene() {
  return new EmbeddedScene({
    body: new SceneFlexLayout({
      children: [
        // getCounterScene(),
        getHelloWordComponentScene(),
      ],
    }),
  });
}


