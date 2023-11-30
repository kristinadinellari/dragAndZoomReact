import React, { Component } from "react";
import { SVG } from "./svg"; // if we will use this as a string
import Draggable from "react-draggable";

interface SvgDragAndZoomState {
  isDragging: boolean;
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
  currentScale: number;
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  svgRef: React.RefObject<HTMLDivElement>;
  svgDocument: Document;

  constructor(props: {}) {
    super(props);

    this.svgRef = React.createRef();
    const parser = new DOMParser();
    this.svgDocument = parser.parseFromString(SVG, "image/svg+xml");

    this.state = {
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
      currentScale: 1,
    };
  }

  componentDidMount = () => {
    this.getAndSetSvgSize();
  };

  componentDidUpdate() {
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

  zoom = (e: any) => {
    e.preventDefault();
    this.setState((prevState) => ({
      currentScale: prevState.currentScale + 0.1,
    }));
  };

  zoom1 = (e: any) => {
    this.setState((prevState) => ({
      currentScale: prevState.currentScale - 0.1,
    }));
  };

  updateTransform = () => {
    const svgElement = this.svgRef.current;
    if (svgElement) {
      svgElement.style.transform = `scale(${this.state.currentScale})`;
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
          <button onClick={this.zoom}>Zoom out</button>
          <button onClick={this.zoom1}>Zoom in</button>
        </div>

        <Draggable>
          <div>
            <div
              ref={this.svgRef}
              dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
              className="svg"
            />
          </div>
        </Draggable>
      </div>
    );
  }
}

export default SvgDragAndZoom;
