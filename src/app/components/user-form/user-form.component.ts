import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Params, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  user = { name: '', email: '' };
  user_id: any;

  constructor(
    private userService: UserService,
    private router: Router,
    private route2: ActivatedRoute
  ) {
    this.route2.params.subscribe(
      (params: Params) => (this.user_id = params['id'])
    );
  }

  ngOnInit(): void {
    if (this.user_id) {
      this.getUser();
    }
  }

  getUser() {
    console.log(this.user_id);
    this.userService.getUser(this.user_id).subscribe((data: any[]) => {
      // console.log(data);
      for (let index = 0; index < data.length; index++) {
        const e = data[index];
        this.user.name = e.name;
        this.user.email = e.email;
      }
    });
  }

  submitForm() {
    if (this.user_id) {
      this.userService.updateUser(this.user_id, this.user).subscribe(() => {
        this.router.navigate(['/users']);
      });
    } else {
      this.userService.createUser(this.user).subscribe(() => {
        this.router.navigate(['/users']);
      });
    }
  }
}
