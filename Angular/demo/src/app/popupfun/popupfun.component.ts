import { OnInit, AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, Injector, OnDestroy, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { HttpService } from '../services/http.service';
import { ConfigResponse } from '../app.component';
import { ComponentPortal, DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { Embed, IReportEmbedConfiguration, Report, service, factories } from 'powerbi-client';
import { HttpPostMessage } from 'http-post-message';
import { WindowPostMessageProxy } from 'window-post-message-proxy';

const popupWindowStyle = 'width=1000,height=500,left=100,top=100';

export class ReportEmbedConfiguration implements IReportEmbedConfiguration {

}


@Component({
  selector: 'app-popupfun',
  templateUrl: './popupfun.component.html',
  styleUrls: ['./popupfun.component.css']
})
export class PopupfunComponent implements OnInit {

  displayMessage = "Click that button!"

  reportConfig = {
    type: 'report',
    tokenType: 1,
    accessToken: "",
    embedUrl: "",
    id: "",
    permissions: 7,
    settings: {
        panes: {
            filters: {
                visible: true
            },
            pageNavigation: {
                visible: true
            }
        }
    }
  };
  private popupWindow: any; // Window;
  


  eventHandlersMap = new Map<string, (event?: service.ICustomEvent<any>) => void>([
    ['loaded', () => console.log('Report has loaded')],
    [
      'rendered',
      () => {
        console.log('Report has rendered');
      },
    ],
    [
      'error',
      (event?: service.ICustomEvent<any>) => {
        if (event) {
          console.error(event.detail);
        }
      },
    ],
    ['visualClicked', (e?: service.ICustomEvent<any> ) => {
      console.log('visual clicked')
      if(e){
        this.displayMessage = JSON.stringify(e.detail);
      }
      
    }],
    ['pageChanged', (event) => console.log(event)],
  ]);

  private portalOutlet!: DomPortalOutlet;
  private componentPortal!: ComponentPortal<PowerBIReportEmbedComponent>;

  wpmpFactory: service.IWpmpFactory = (name?: string, logMessages?: boolean, eventSourceOverrideWindow?: Window) => {
    return new WindowPostMessageProxy({
      processTrackingProperties: {
        addTrackingProperties: HttpPostMessage.addTrackingProperties,
        getTrackingProperties: HttpPostMessage.getTrackingProperties,
      },
      isErrorMessage: HttpPostMessage.isErrorMessage,
      suppressWarnings: false,
      name: "this-is-my-custom-name",
      logMessages: true,
      eventSourceOverrideWindow: eventSourceOverrideWindow,
      receiveWindow: this.popupWindow
    });
  };

  public service !: service.Service;

  constructor(public httpService: HttpService,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly applicationRef: ApplicationRef,
    private readonly injector: Injector,
    private readonly viewContentRef: ViewContainerRef) { }

  ngOnInit(): void {
  }

  async doClick(e: any) {
    console.log("I did a thing!")
    this.popupWindow = window.open('', 'powerbi-report-popupfun', popupWindowStyle);
    this.service = new service.Service(factories.hpmFactory, this.wpmpFactory, factories.routerFactory);
    

    let reportConfigResponse: ConfigResponse;
    try {
      reportConfigResponse = await this.httpService.getEmbedConfig("https://aka.ms/CaptureViewsReportEmbedConfig").toPromise();
    } catch (error: any) {
      
      this.displayMessage = `Failed to fetch config for report. Status: ${error.statusText} Status Code: ${error.status}`;
      console.error(this.displayMessage);
      return;
    }
    this.reportConfig = {
      ...this.reportConfig,
      id: reportConfigResponse.Id,
      embedUrl: reportConfigResponse.EmbedUrl,
      accessToken: reportConfigResponse.EmbedToken.Token,
    };
    console.log(this.reportConfig)
    this.displayMessage = 'Access token is successfully set. Loading Power BI report.';
    
    this.componentPortal = new ComponentPortal(PowerBIReportEmbedComponent, this.viewContentRef, this.injector, this.componentFactoryResolver);
    console.log(this.componentPortal);
    const appRoot = this.popupWindow.document.body //.getElementsByTagName('app-root')[0]
    this.portalOutlet = new DomPortalOutlet(appRoot, this.componentFactoryResolver, this.applicationRef, this.injector);
    const embededViewRef = this.portalOutlet.attach(this.componentPortal);
    embededViewRef.instance.eventHandlers = this.eventHandlersMap;
    embededViewRef.instance.embedConfig = this.reportConfig;
    embededViewRef.instance.service = this.service;
    embededViewRef.changeDetectorRef.detectChanges();
    console.log("This is my instance!")
    console.log(embededViewRef.instance)
    embededViewRef.instance.getReport().on("visualClicked", (e: any) => {
      console.log("it would be nice if this worked...")
    })

  }

}
