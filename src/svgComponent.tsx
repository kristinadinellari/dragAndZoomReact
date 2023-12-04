import { Component } from "react";
import Draggable from "react-draggable";
import { bigSvg } from "./big-svg";
import { smallSvg } from "./small-svg";

interface SvgDragAndZoomState {
  isDragging: boolean;
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
  currentScale: number;
  zoomReset: boolean;
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  svgDocument: Document;

  constructor(props: {}) {
    super(props);

    const parser = new DOMParser();
    this.svgDocument = parser.parseFromString(smallSvg, "image/svg+xml");

    this.state = {
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
      currentScale: 1,
      zoomReset: false,
    };
  }

  componentDidMount = () => {
    this.getAndSetSvgSize();
  };

  componentDidUpdate = () => {
    this.updateTransform();
  }

  getAndSetSvgSize() {
    const svgSize = document
      .getElementsByClassName("svg")[0]
      .getElementsByTagName("svg")[0]
      .getBBox();
    this.setState({
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: svgSize.width, height: svgSize.height }, // Update viewBox after getting the svg dimensions
    });
  }

  zoomIn = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState((prevState) => ({
      currentScale: (prevState.currentScale + 0.5) >= 10 ? 4 : prevState.currentScale + 0.1,
    }));
    console.log('zoomIn currentScale', this.state.currentScale);
  };
  
  zoomOut = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState((prevState) => ({
      currentScale: (prevState.currentScale - 0.5) <= 2 ? prevState.currentScale - 0.1 : 4,
    }));
    console.log('zoomOut currentScale', this.state.currentScale);
  };

  zoomReset = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState(() => ({
      currentScale: 1, // default scaling
      zoomReset: true
    }));
    console.log('zoomOut currentScale', this.state.currentScale);
  };
  
  updateTransform = () => {
    const svgElement = document.getElementsByTagName("svg")[0];
    if (svgElement) {
      svgElement.style.transform = `scale(${this.state.currentScale})`;
    }
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
            // style={{height: "100%", backgroundColor: "red"}}
          />
        </Draggable>
      </div>
    );
  }
}

export default SvgDragAndZoom;
