import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private state;
  private pod_id;
  podcast_list: String[];
  private list_summary;
  private text_summary;
  private view;

  constructor(private http: HttpClient) {
    this.state = 0;
    this.pod_id = 0;
    this.podcast_list = []
    this.list_summary = "";
    this.text_summary = "";
    this.view = "text"
    this.getAvailablePodcasts()

  }

  getAvailablePodcasts() {
    const url = 'http://34.224.66.244:8000/podcasts';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    /*const data = {
      podcast_name : prompt,
    };*/
    const data = {
      pid: null,
      podcast_name : null,
      select_all : true
    };
  
    this.http.post(url, data, { headers: headers }).subscribe((response: any) => {
      console.log(response);
      //Add values to podcasts lists
      const sel = <HTMLSelectElement>document.getElementById('podcast_selector');
      const opt = document.createElement('option');
      opt.value = response['2'].podcast_name;
      opt.text = response['2'].podcast_name;
      sel.add(opt);
      this.podcast_list.push(response['2'])

      // Get podcast ID
    }, (error: any) => {
      console.error(error);
    });
  }

  onSendButtonClick() {
    // Podcast summary 
    debugger;
    const url = 'http://34.224.66.244:8000/podcasts';

    const prompt = (<HTMLSelectElement>document.getElementById('podcast_selector')).value;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    /*const data = {
      podcast_name : prompt,
    };*/
    const data = {
      pid: null,
      podcast_name : prompt,
      select_all : false
    };
  
    this.http.post(url, data, { headers: headers }).subscribe((response: any) => {
      console.log(response);
      debugger;
      this.pod_id = response['2'].pid;
      this.list_summary = response['2'].list_summary;
      this.text_summary = response['2'].text_summary;
      // Display summary in text area
      const textarea = <HTMLTextAreaElement>document.getElementById('podcast_summary_output'); // assumes that the textarea element has an ID of "my_textarea"
      textarea.value = this.text_summary;

    }, (error: any) => {
      console.error(error);
    });
  }

  onAskButtonClick() {
    const url = 'http://34.224.66.244:8000/qa';
    const prompt = (<HTMLInputElement>document.getElementById('user_prompt')).value;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    /*const data = {
      podcast_name : prompt,
    };*/
    const data = {
      pid: this.pod_id,
      question : prompt
    };
  
    this.http.post(url, data, { headers: headers }).subscribe((response: any) => {
      console.log(response);
          // Display answer in text area
          const textarea = <HTMLTextAreaElement>document.getElementById('podcast_q&a_output'); // assumes that the textarea element has an ID of "my_textarea"
          textarea.value = response;

    }, (error: any) => {
      console.error(error);
    });
  }

  onChangeView() {
    const textarea = <HTMLTextAreaElement>document.getElementById('podcast_summary_output'); // assumes that the textarea element has an ID of "my_textarea"
    if (this.view == "text") {
      textarea.value = this.list_summary; 
      this.view = "list";
    }
    else {
      textarea.value = this.text_summary;
      this.view = "text";
    }
  }
}
