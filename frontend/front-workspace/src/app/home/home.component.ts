import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private pod_id;
  private podcast_list;
  private list_summary;
  private text_summary;
  private view;
  private name;

  constructor(private http: HttpClient) {
    this.name = "";
    this.pod_id = 0;
    this.list_summary = "";
    this.text_summary = "";
    this.view = "text";
    this.podcast_list = {
      data: [],
      [Symbol.iterator]() {
        let index = 0;
        const dataArray = this.data;
        const iterator = {
          next(): { value: any, done: boolean } {
            if (index < dataArray.length) {
              const result = { value: dataArray[index], done: false };
              index++;
              return result;
            } else {
              return { value: undefined, done: true };
            }
          }
        };
        return iterator;
      }
    };
    this.getAvailablePodcasts()

  }

  getAvailablePodcasts() {
    const url = 'http://23.22.193.184:8000/podcasts';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    /*const data = {
      podcast_name : prompt,
    };*/
    const data = {
      pid: null,
      podcast_name : null,
      select_all : true
    };
  
    this.http.post(url, data, { headers: headers }).subscribe((response: any) => {
      debugger;
      console.log(response);
      //Add values to podcasts lists
      this.podcast_list.data = Object.values(response)
      const sel = <HTMLSelectElement>document.getElementById('podcast_selector');
      for(const podcast of this.podcast_list){
        const opt = document.createElement('option');
        opt.text = podcast.podcast_title;
        opt.value = podcast.pid;
        sel.add(opt);
      }
      /*const opt = document.createElement('option');
      opt.value = response['2'].podcast_name;
      opt.text = response['2'].podcast_name;
      sel.add(opt);
      this.podcast_list.push(response['2'])*/

      // Get podcast ID
    }, (error: any) => {
      console.error(error);
    });
  }

  onSendButtonClick() {
    // Podcast summary 
    debugger;
    const url = 'http://23.22.193.184:8000/podcasts';

    const prompt = (<HTMLSelectElement>document.getElementById('podcast_selector')).value;
    this.pod_id = parseInt(prompt, 10);;
    this.podcast_list.data.forEach(element => {
        if (element['pid'] == this.pod_id) {
          this.name = element['podcast_name'];
        }
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const data = {
      pid: null,
      podcast_name : this.name,
      select_all : false
    };
  
    this.http.post(url, data, { headers: headers }).subscribe((response: any) => {
      debugger;
      console.log(response);
      this.pod_id = response[this.pod_id].pid;
      this.list_summary = response[this.pod_id].list_summary;
      this.text_summary = response[this.pod_id].text_summary;
      // Display summary in text area
      const textarea = <HTMLTextAreaElement>document.getElementById('podcast_summary_output'); // assumes that the textarea element has an ID of "my_textarea"
      textarea.value = this.text_summary;

    }, (error: any) => {
      console.error(error);
    });
  }

  onAskButtonClick() {
    const url = 'http://23.22.193.184:8000/qa';
    const prompt = (<HTMLInputElement>document.getElementById('user_prompt')).value;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
