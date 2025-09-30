import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { Account } from 'src/app/shared/models/account';
import { UserDTO } from 'src/app/shared/components/transaction/models/userDTO';
import { User } from 'src/app/shared/models/user';

@Component({
    selector: 'app-account-page',
    templateUrl: './account-page.component.html',
    styleUrls: ['./account-page.component.css']
})
export class AccountPageComponent implements OnInit {
    user: User | undefined;

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.userService.getUser().subscribe((data) => {
            this.user = data.result[0];
        });
    }
}
