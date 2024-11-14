import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IReportEmbedConfiguration, models, Page, Report, service, Embed } from 'powerbi-client';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { IHttpPostMessageResponse } from 'http-post-message';
// import 'powerbi-report-authoring';

import { PowerBIService } from './services/power-bi-service.service';
import { DomSanitizer,  SafeResourceUrl } from '@angular/platform-browser';

interface DataRow {
  id: number;
  name: string;
  value: number;
}

export interface ConfigResponse {
  Id: string;
  EmbedUrl: string;
  EmbedToken: {
    Token: string;
  };
}

export const reportUrl = 'https://aka.ms/CaptureViewsReportEmbedConfig'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  @ViewChild(PowerBIReportEmbedComponent) reportObj!: PowerBIReportEmbedComponent;

  isEmbedded = false;
  displayMessage = 'The report is being embedded...';
  reportClass = 'report-container';
  phasedEmbeddingFlag = false;
  pages: Page[] = [];
  activePage!: Page;

  reportConfig: IReportEmbedConfiguration = {
    type: 'report',
    embedUrl: undefined,
    tokenType: models.TokenType.Embed,
    accessToken: undefined,
    settings: { 
      navContentPaneEnabled: false,
      background: models.BackgroundType.Default
     }, // Disable bottom navigation pane
  };

  constructor(public httpService: PowerBIService, private element: ElementRef<HTMLDivElement>, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // this.embedReport(); // Embed the report automatically when the component initializes
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.embedReport(), 0);; // Embed the report once ViewChild is initialized
  }
  async embedReport(): Promise<void> {
    let reportConfigResponse: ConfigResponse;

    try {
      // Replace with actual fetch logic if needed
      reportConfigResponse  = {
                Id: 'bac7c3a3-7ccd-46a1-a580-728cddbd66e1',
                EmbedUrl: 'https://app.powerbi.com/reportEmbed?reportId=bac7c3a3-7ccd-46a1-a580-728cddbd66e1&groupId=883daf4b-6b56-40a9-83f2-56d8b52a48cc&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLUNFTlRSQUwtQi1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19',
                EmbedToken: {
                  Token: 'H4sIAAAAAAAEAB2Tx86jaBBF3-Xf0hI5tdQLco6fiTtsMphk8mjefTy9v1LVPXXqnx83u_oxy39-_5zSTi570H9CdZGCmR8rglYxWevARYifJU5RdPSDpZnSyCKpZcqKnXhZL5hcK3LBkLlNAWzeqeXZ3W6WJGF3uabSKEqYQaMh14EgjlSx_Wbu6uXgF4_k4ipLJRzy2mspKZcur-YAEnaeGOVeRYOPldbSouANsRQEGZW6DGbBU9CZTBI_qBfaWVtvIYPFRBN5cpZe84PdqrXSQsCOYZpkCZG1O2Y8tqUCyUgHbnSsDOnFdw_IqCPJDO7iwN9rTdkFr9PCFc6zMIDmzMUfCCtCu-Oj2ghQrvIfZreZt-7v00G0kKEgHO1lmG7CdWnBLFsma9346ccclUBRADhz3rWlDyMYMYtEhYU98KBT9F35yIxFnmFz0sWOzbzBx5J0YrcCQtCRzzyq-ZRs-qE9QeDDvik2FFPugk1vjy28H3y3EjxXSlpQHFu2uueOhjjuduYW5c8Ei7B09Q0x80-mF-pxUvCTUkbvIcR4WFCD8qju11w7mtKq7Ft7s4VITzIq7DV0Cx9Ta9N650Odk1nMzJ6vM9hyxtATZgw-z_l4mJABx1uwucLz1SywqY9AHrhTQ_M5iNOj_vpiysDHlKCOQiafZ8O_eBl_pyv5xm8WujrdZMu8ilyvVgwKwUCYUdDQq4WseENwp0UTHW18nFO03oYUXZFc-JKiJZUHdNbx4os83bb4Tju1qg8CpTg7TTnqd7qj6MtH2bfjJDhXn-lnms5mwL095Ah9vfoV4xVa5AzZzshotkbrz8-vH2G5pnU0iuurflMa9Fy3_eIVy6D11X1JM-4BdkUx7r2et4MZT58USlBZZSbBL45A6ad8FRI6LPkT97IpBnGIHz2uOnqeHwPP9Ep0szSF51jygcqNHU-zLqWoQsrWawWsADIxlvijpeGdW9UskzQ8vBnsgtLpRBO3PJb57ZjoeSPBLb_HuAONCh1mq-5cUnKY9Urz9Ul0w-Cn9jHoYWEXcsWO_sofRV09E96bHcoI3zIY7Gj0oe92V0fuGYXYk1J-knWxs7BFMHVsRDfQs_rFHQ0v4KUwc6Gu78GKkgZrxP16FxUKiHqoJZnBGn_JDmrNpF7J1QLrx8Dvc7-pO5Yl86YXk5vb64sxUrP3_vzFfE11sWjhl7J0kC--yzQ77SgOklGvDAZQ_U2BphqydVuKb6wfiR7w3sbhdLnfcuiJ8Nf3lJgHgo_fA-bHzW4lpeKQtUHTpvvIEho9lMwRklUcqee6aWnsVmOdA4gi-oKmSkTmTXZyVMLWwtiBbCyoRKHwOeUdiqwxRTi4P1ank9d0zq2ctooIBxpc0Knpf3-0YKAtNC6LQqvlcc7IM8VaptGSecXeaNPh-hM9u6FMH2Z7fcSgQkUd2WCwUG9DbY8HcuiohcNQjpQaqxst381fCWn1SUmFAFDoluFMHWiAOERQt8T3WHMH2ZESCjUGcve4RvxT1-_Qc2V0F6r22K71Gc6JGWVWtqDf8uFYHKDb-HGpMZVhtcr0dNU-h0vR_clmYylq_sf873-5ge_A7gUAAA==.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLUNFTlRSQUwtQi1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZXhwIjoxNzMxNTkxOTQ0LCJhbGxvd0FjY2Vzc092ZXJQdWJsaWNJbnRlcm5ldCI6dHJ1ZX0='
                }
              }

      this.reportConfig = {
        ...this.reportConfig,
        id: reportConfigResponse.Id,
        embedUrl: reportConfigResponse.EmbedUrl,
        accessToken: reportConfigResponse.EmbedToken.Token,
      };

      this.isEmbedded = true;
      const report = this.reportObj.getReport();
      
      report.on('loaded', async () => {
        this.pages = await report.getPages();
        if (this.pages.length > 0) {
          this.activePage = this.pages[0];
          await this.activePage.setActive(); // Display the first page by default
          this.cdr.detectChanges(); // Update the UI after pages are loaded
        }
        await this.changeVisualType()
      });

      // Fetch and set the report pages for tab navigation
    } catch (error: any) {
      this.displayMessage = `Failed to fetch config for report: ${error.message}`;
      console.error(this.displayMessage);
    }
    
  }

  async switchPage(selectedIndex: number): Promise<void> {
    const selectedPage = this.pages[selectedIndex];
    if (selectedPage && this.reportObj) {
      try {
        await selectedPage.setActive();
        this.activePage = selectedPage;
      } catch (error) {
        console.error(`Failed to switch to page ${selectedPage.displayName}:`, error);
      }
    }
  }

  async changeVisualType(): Promise<void> {
    const report = this.reportObj.getReport();
    if (!report) {
      this.displayMessage = 'Report not available.';
      return;
    }

    this.pages = await report.getPages();
    this.activePage = this.pages[0];

    const activePage = this.pages.find((page) => page.isActive);
    if (!activePage) {
      this.displayMessage = 'No Active page found';
      return;
    }

    try {
      const visual = await activePage.getVisualByName('VisualContainer6');
      // const response = await visual.changeType('lineChart');
      this.displayMessage = `The ${visual.type} was updated to lineChart.`;
    } catch (error) {
      console.error(error === 'PowerBIEntityNotFound' ? 'No Visual found with that name' : error);
    }
  }
}

