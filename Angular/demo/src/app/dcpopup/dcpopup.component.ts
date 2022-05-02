import { OnInit, AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, Injector, OnDestroy, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { HttpService } from '../services/http.service';
import { ConfigResponse } from '../app.component';
import { ComponentPortal, DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { Embed, IReportEmbedConfiguration, Report, service, factories } from 'powerbi-client';
import { HttpPostMessage } from 'http-post-message';
import { WindowPostMessageProxy } from 'window-post-message-proxy';

const popupWindowStyle = 'width=1000,height=500,left=100,top=100';

@Component({
    selector: 'app-dcpopup',
    templateUrl: './dcpopup.component.html',
    styleUrls: ['./dcpopup.component.css']
  })
export class DcpopupComponent implements OnInit {
    private popupWindow!: Window;

    displayMessage = "Click that dc button!"
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


    hpmFactory: service.IHpmFactory = (wpmp, defaultTargetWindow, sdkVersion, sdkType) => {
        return new HttpPostMessage(wpmp, {
          'x-sdk-type': sdkType,
          'x-sdk-version': sdkVersion
        }, defaultTargetWindow);
    };
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

    public powerbi !: service.Service;

    public report !: Embed;
    constructor( public httpService: HttpService ) {};

    ngOnInit(): void {
    }

    async doClick(e: any) {
        console.log("I did a vanilla thing!")
        this.popupWindow = (<Window>window.open('', 'powerbi-report-vanillapopup', popupWindowStyle));
        const appRoot = this.popupWindow.document.body;
        const divEle = document.createElement('div');
        divEle.className = "report-container"
        appRoot.appendChild(divEle)

        this.powerbi = new service.Service(factories.hpmFactory, this.wpmpFactory, factories.routerFactory);
        //this.report = this.powerbi.bootstrap(divEle, this.reportConfig);
        

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
        this.report = this.powerbi.embed(divEle, this.reportConfig);

        this.report.off("loaded");

        // Report.on will add an event handler which prints to Log window.
        this.report.on("loaded", function () {
            console.log("Loaded");
        });
    
        // Report.off removes a given event handler if it exists.
        this.report.off("rendered");
    
        // Report.on will add an event handler which prints to Log window.
        this.report.on("rendered", function () {
            console.log("Rendered");
        });

        this.report.on("visualClicked", function (event){
            console.log("visualClicked...")
            console.log(event)
        });
        this.popupWindow.addEventListener("visualClicked", (event: any) => {
            console.log('vanillapopup... visualClicked')
            console.log(event);
            this.displayMessage = JSON.stringify((<service.ICustomEvent<any>>event).detail)
        })
        console.log('PowerBI')
        console.log(this.powerbi)
        console.log(this.popupWindow)

    }
}