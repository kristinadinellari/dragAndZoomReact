import { Component } from "react";
import Draggable from "react-draggable";
import { bigSvg } from "./big-svg";
import { smallSvg } from "./small-svg";

interface SvgDragAndZoomState {
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
  zoomScale: number,
  zoomReset: boolean,
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  svgDocument: Document;

  constructor(props: {}) {
    super(props);

    const parser = new DOMParser();
    this.svgDocument = parser.parseFromString(smallSvg, "image/svg+xml");

    this.state = {
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
      zoomScale: 1, // Default zoom sensitivity
      zoomReset: false,
    };
  }

  componentDidMount = () => {
    this.updateSvgSize();
  };

  componentDidUpdate = () => {
    this.setStyle();
  }

  updateSvgSize() {
    const svgSize = document
      .getElementsByClassName("svg")[0]
      .getElementsByTagName("svg")[0]
      .getBBox();
    this.setState({
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: svgSize.width, height: svgSize.height }, // Update viewBox after getting the svg dimensions
    });
  }

  zoomIn = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState((prevState) => ({
      zoomScale: (prevState.zoomScale + 0.5) >= 10 ? 4 : prevState.zoomScale + 0.1,
    }));
  };
  
  zoomOut = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState((prevState) => ({
      zoomScale: (prevState.zoomScale - 0.5) <= 2 ? prevState.zoomScale - 0.1 : 4,
    }));
  };

  zoomReset = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState(() => ({
      zoomScale: 1,
      zoomReset: true
    }));
  };
  
  setStyle = () => {
    const svgElement = document.getElementsByTagName("svg")[0];

    if (!svgElement) return;

    svgElement.style.transform = `scale(${this.state.zoomScale})`;

    if (this.state.zoomReset) {
      svgElement.style.transformOrigin = `50% 50%`;
    }
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
          <button onClick={this.zoomIn}>Zoom In</button>
          <button onClick={this.zoomOut}>Zoom out</button>
          <button onClick={this.zoomReset}>Reset</button>
        </div>

        <Draggable>
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
