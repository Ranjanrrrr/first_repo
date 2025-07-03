import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-report',
  imports: [RouterLink],
  templateUrl: './report.html',
  styleUrl: './report.css'
})
export class Report {
   openReport(reportName: string): void {
    // You can route, generate, or download reports here
    alert(`📝 Open ${reportName} report`);
  }


}
