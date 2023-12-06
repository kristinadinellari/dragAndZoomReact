// I had to remove ts-check because it was preventing me from adding properties to the Draggable component.
// In the ea repository, this works perfectly fine, as I attempted to add the properties to the existing implementation there.

// @ts-nocheck
import { Component } from "react";
import Draggable from "react-draggable";
import { bigSvg } from "./big-svg";
import { smallSvg } from "./small-svg";

interface SvgDragAndZoomState {
  viewBox: { x: number; y: number; width: number; height: number };
  zoomScale: number;
}

enum SCALE {
  default = 0.1,
  min = 0.2,
  max = 2,
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  svgDocument: Document;

  constructor(props: {}) {
    super(props);

    const parser = new DOMParser();
    this.svgDocument = parser.parseFromString(bigSvg, "image/svg+xml");

    this.state = {
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
      zoomScale: 1, // Default zoom sensitivity
      position: { x: 0, y: 0 },
    };
  }

  componentDidMount = () => {
    this.updateSvgSize();
  };

  componentDidUpdate = () => {
    this.setStyle();
  };

  updateSvgSize() {
    const svgSize = document
      .getElementsByClassName("svg")[0]
      .getElementsByTagName("svg")[0]
      .getBBox();
    this.setState({
      viewBox: { x: 0, y: 0, width: svgSize.width, height: svgSize.height }, // Update viewBox after getting the svg dimensions
    });
  }

  zoomIn = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState((prevState) => ({
      // we need to change the max value with the one that PO will add on Spec document.
      zoomScale:
        this.state.zoomScale >= SCALE.max
          ? SCALE.max
          : prevState.zoomScale + SCALE.default,
    }));
  };

  zoomOut = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState((prevState) => ({
      // we need to change the min value with the one that PO will specify on the Spec document
      zoomScale:
        this.state.zoomScale <= SCALE.min
          ? SCALE.default
          : prevState.zoomScale - SCALE.default,
    }));
  };

  zoomReset = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState(() => ({
      zoomScale: 1,
      position: { x: 0, y: 0 },
    }));
  };

  setStyle = () => {
    const svgElement = document.getElementsByTagName("svg")[0];

    if (!svgElement) return;

    svgElement.style.transform = `scale(${this.state.zoomScale})`;
  };

  render() {
    const { viewBox } = this.state;
    const newViewBox = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

    if (newViewBox) {
      const svgElement = this.svgDocument.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("viewBox", newViewBox);
      }
    }

    const modifiedSvgString = new XMLSerializer().serializeToString(
      this.svgDocument
    );

    return (
      <div
        className="discoveredModel"
        style={{ width: "100%", height: "100vh", overflow: "hidden" }}
      >
        <div
          className="buttons"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <button onClick={this.zoomIn}>Zoom in</button>
          <button onClick={this.zoomOut}>Zoom out</button>
          <button onClick={this.zoomReset}>Reset</button>
        </div>
        <Draggable
          position={this.state.position}
          onDrag={(e, data) =>
            this.setState({ position: { x: data.x, y: data.y } })
          }
        >
          <div
            dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
            className="svg"
          />
        </Draggable>
      </div>
    );
  }
}

export default SvgDragAndZoom;
