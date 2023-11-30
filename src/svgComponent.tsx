import { Component } from "react";
import { SVG } from "./svg"; // if we will use this as a string
import Draggable from 'react-draggable'

interface SvgDragAndZoomState {
  isDragging: boolean;
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  svgDocument: Document;

  constructor(props: {}) {
    super(props);

    const parser = new DOMParser();
    this.svgDocument = parser.parseFromString(SVG, "image/svg+xml");

    this.state = {
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
    };
  }

  componentDidMount = () => {
    this.getAndSetSvgSize();
  }

  getAndSetSvgSize() {
    console.log('size: ', document.getElementsByClassName('svg')[0].getElementsByTagName('svg')[0].getBBox());
    const svgSize =  document.getElementsByClassName('svg')[0].getElementsByTagName('svg')[0].getBBox();
    this.setState({
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: svgSize.width, height: svgSize.height }, // Update viewBox after getting the svg dimensions
    });
  }

  zoom = (e: any) => {
    e.preventDefault();

    const scaleFactor = 1.2; // this value is to define how much you want to scale
    const delta = e.clientY > 0 ? scaleFactor : 1 / scaleFactor;

    this.setState((prevState) => ({
      viewBox: {
        x: prevState.viewBox.x,
        y: prevState.viewBox.y,
        width: prevState.viewBox.width * delta,
        height: prevState.viewBox.height * delta,
      },
    }));
  };

  zoom1 = (e: any) => {
    e.preventDefault();

    const scaleFactor = 1.2; // this value is to define how much you want to scale
    const delta = e.clientY < 0 ? scaleFactor : 1 / scaleFactor;

    this.setState((prevState) => ({
      viewBox: {
        x: prevState.viewBox.x,
        y: prevState.viewBox.y,
        width: prevState.viewBox.width * delta,
        height: prevState.viewBox.height * delta,
      },
    }));
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
        <div className="buttons" style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={this.zoom}>Zoom out</button>
          <button onClick={this.zoom1}>Zoom in</button>
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
