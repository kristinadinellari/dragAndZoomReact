import React, { Component, createRef } from "react";
import { SVG } from "./svg"; // if we will use this as a string
// import SVGTest from "./svgTest.svg"; // if we will use as an image
// import { ReactComponent as SVGTest } from "./svgTest.svg"; if we will use this as a component directly
import panzoom  from "panzoom"

interface SvgDragAndZoomState {
  isDragging: boolean;
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  panZoomRef: any;
  elementRef: any;
  
  constructor(props: {}) {
    super(props);

    this.state = {
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
    };

  
    this.panZoomRef = createRef();
    this.elementRef = createRef();
  }

  componentDidMount = () => {
    this.getAndSetSvgSize();
    this.panZoomRef.current = panzoom(this.elementRef.current);
    this.panZoomRef.current.on('pan', () => console.log('Pan!'));
    this.panZoomRef.current.on('zoom', () => console.log('Zoom!'));
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
    console.log("Rendering: " + Date.now());
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

    // console.log('svgDocument', svgDocument);

    return (
      <div        
        // onWheel={this.zoom}
        className="discoveredModel"        
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      >
        <div className="buttons" style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={this.zoom}>Zoom out</button>
          <button onClick={this.zoom1}>Zoom in</button>
        </div>

        <div
          ref={this.elementRef}
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
