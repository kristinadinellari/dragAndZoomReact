import React, { Component } from "react";
import { SVG } from "./svg"; // if we will use this as a string
// import SVGTest from "./svgTest.svg"; // if we will use as an image
// import { ReactComponent as SVGTest } from "./svgTest.svg"; if we will use this as a component directly

interface SvgDragAndZoomState {
  containerRect: { height: number, width: number },
  isDragging: boolean;
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  containerRef: any;
  

  constructor(props: {}) {
    super(props);

    const defaultRect = { height: 0, width: 0};

    this.containerRef = React.createRef();
    
    this.state = {
      containerRect: defaultRect,
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
    };
  }

  componentDidMount = () => {
    this.setState(state => {
      if (this.containerRef.current) {
        const containerRect = this.containerRef.current.getBoundingClientRect();
        console.log("componentDidMount");
        console.log('Container height and width: ', containerRect.height, containerRect.width);
        state.viewBox.width = containerRect.width;
        state.viewBox.height = containerRect.height;
      } 
    });
  }

  startDrag = (e: React.MouseEvent) => {
    this.setState({
      isDragging: true,
      startPoint: { x: e.clientX, y: e.clientY },
    });
  };

  endDrag = () => {
    this.setState({
      isDragging: false,
    });
  };

  drag = (e: React.MouseEvent) => {
    if (!this.state.isDragging) return;

    const dx = e.clientX - this.state.startPoint.x;
    const dy = e.clientY - this.state.startPoint.y;

    this.setState((prevState) => ({
      startPoint: { x: e.clientX, y: e.clientY },
      viewBox: {
        x: prevState.viewBox.x - dx,
        y: prevState.viewBox.y - dy,
        width: prevState.viewBox.width,
        height: prevState.viewBox.height,
      },
    }));
  };

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
    const parser = new DOMParser();
    const svgDocument = parser.parseFromString(SVG, "image/svg+xml");

    if (newViewBox) {
      const svgElement = svgDocument.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("viewBox", newViewBox);
      }
    }

    const modifiedSvgString = new XMLSerializer().serializeToString(
      svgDocument
    );

    console.log('svgDocument', svgDocument);

    return (
      <div
        onMouseDown={this.startDrag}
        onMouseUp={this.endDrag}
        onMouseMove={this.drag}
        // onWheel={this.zoom}
        className="discoveredModel"
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
        ref={this.containerRef}
      >
        <div className="buttons" style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={this.zoom}>Zoom out</button>
          <button onClick={this.zoom1}>Zoom in</button>
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
          className="svg"
          // style={{ width: "100%", height: "100%" }}
        />

        {/* <img src={SVGTest} alt="" /> */}
        {/* <SVGTest /> */}

        {/* <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          dangerouslySetInnerHTML={{ __html: SVG }}
        /> */}
      </div>
    );
  }
}

export default SvgDragAndZoom;
