import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-block-page',
  templateUrl: './block-page.page.html',
  styleUrls: ['./block-page.page.scss'],
})
export class BlockPagePage implements OnInit {
  data: any;
  constructor (
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.data = JSON.parse (this.route.snapshot.paramMap.get ('data'));
    console.log (this.data);
  }
}
