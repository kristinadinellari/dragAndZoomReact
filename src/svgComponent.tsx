import React, { Component } from "react";
import { SVG } from "./svg"; // if we will use this as a string
import Resizable from 're-resizable'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'

// import SVGTest from "./svgTest.svg"; // if we will use as an image
// import { ReactComponent as SVGTest } from "./svgTest.svg"; if we will use this as a component directly

interface SvgDragAndZoomState {
  isDragging: boolean;
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  svgTest = '';
  svgUrl = '';

  constructor(props: {}) {
    super(props);

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
    if (this.svgTest === '') {
      console.log('size: ', document.getElementsByClassName('svg')[0].getElementsByTagName('svg')[0].getBBox());
      const svgSize =  document.getElementsByClassName('svg')[0].getElementsByTagName('svg')[0].getBBox();
      this.setState({
        isDragging: false,
        startPoint: { x: 0, y: 0 },
        viewBox: { x: 0, y: 0, width: svgSize.width, height: svgSize.height }, // Update viewBox after getting the svg dimensions
      });
    }
  }

  // startDrag = (e: React.MouseEvent) => {
  //   this.setState({
  //     isDragging: true,
  //     startPoint: { x: e.clientX, y: e.clientY },
  //   });
  // };

  // endDrag = () => {
  //   this.setState({
  //     isDragging: false,
  //   });
  // };

  // drag = (e: React.MouseEvent) => {
  //   if (!this.state.isDragging) return;

  //   const dx = e.clientX - this.state.startPoint.x;
  //   const dy = e.clientY - this.state.startPoint.y;

  //   this.setState((prevState) => ({
  //     startPoint: { x: e.clientX, y: e.clientY },
  //     viewBox: {
  //       x: prevState.viewBox.x - dx,
  //       y: prevState.viewBox.y - dy,
  //       width: prevState.viewBox.width,
  //       height: prevState.viewBox.height,
  //     },
  //   }));
  // };

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

    if (viewBox.width !== 0 && viewBox.height !== 0) {
      this.svgTest = `${`data:image/svg+xml;utf8,${encodeURIComponent(modifiedSvgString)}`}`
      const blob = new Blob([modifiedSvgString], {type: 'image/svg+xml'});
      this.svgUrl = URL.createObjectURL(blob);
      console.log(this.svgUrl);
    }

    console.log('svgDocument', svgDocument);

    return (
      <div
        className="discoveredModel"
        style={{ width: "100%", height: "100vh", overflow: "hidden" }}
      >
        {/* <div className="buttons" style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={this.zoom}>Zoom out</button>
          <button onClick={this.zoom1}>Zoom in</button>
        </div> */}

        {this.svgTest === '' && <div
          dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
          className="svg"
        />}

        {/* Martina - approach 1 to explore where we have only Draggable elemenent and img tag inside */}
        {/* {this.svgTest !== '' && 
          <Draggable>
            <img src={this.svgTest} alt="" />
          </Draggable>
        } */}

        {/* Martina - approach 2 to explore where we have both Draggable and Resizable react elemenents. 
          zoom methods need to be reworked. With background url dragging is slower then in the approach 1  
        */}
        {this.svgTest !== '' && 
          <Draggable>
            <Resizable
              className="resizable"
              defaultSize={{
                width: 'auto',
                height: '100%'
              }}
              style={{
                background: `url(${this.svgUrl})`
                // background: `url(${this.svgTest})`
                // background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><line x1="25" y1="25" x2="25" y2="12" stroke="red"/></svg>')`
              }}
              lockAspectRatio={true}
            >
            </Resizable>
          </Draggable>
        }
      </div>
    );
  }
}

export default SvgDragAndZoom;
