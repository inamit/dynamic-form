import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { loadRemoteComponent } from './load-remote';

@Component({
  selector: 'app-react-wrapper',
  template: '<div #reactRoot></div>',
  standalone: true
})
export class ReactWrapperComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('reactRoot', { static: true }) reactRootRef!: ElementRef;

  @Input() url!: string;
  @Input() scope!: string;
  @Input() module!: string;
  @Input() componentProps: Record<string, any> = {};

  private root: ReactDOMClient.Root | null = null;
  private ReactComponent: React.ComponentType<any> | null = null;
  private isLoaded = false;

  async ngAfterViewInit() {
    try {
      this.ReactComponent = await loadRemoteComponent(this.url, this.scope, this.module) as React.ComponentType<any>;
      this.isLoaded = true;
      this.render();
    } catch (err) {
      console.error('Error loading React component:', err);
      this.reactRootRef.nativeElement.innerHTML = '<p>Error loading component</p>';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isLoaded) {
      this.render();
    }
  }

  private render() {
    if (!this.ReactComponent) return;

    if (!this.root) {
      this.root = ReactDOMClient.createRoot(this.reactRootRef.nativeElement);
    }

    const reactElement = React.createElement(this.ReactComponent, this.componentProps);
    this.root.render(reactElement);
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.unmount();
    }
  }
}
