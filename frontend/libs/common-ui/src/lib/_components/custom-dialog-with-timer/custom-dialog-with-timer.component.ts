import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailConfirmationService } from '@frontend/common';
import { Subscription, timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';

@Component({
	selector: 'frontend-custom-dialog-with-timer',
	templateUrl: './custom-dialog-with-timer.component.html',
	styleUrls: [],
	standalone: false,
})
export class CustomDialogWithTimerComponent extends CustomDialogComponent implements OnInit, OnDestroy {
	public isCustomDialogWithButton = true;
	public remainingTime = 60;

	private timerSubscription: Subscription;

	constructor(
		@Inject(MAT_DIALOG_DATA) public override data: any,
		protected override readonly dialogRef: MatDialogRef<CustomDialogComponent>,
		private confirmationEmailService: EmailConfirmationService,
	) {
		super(data, dialogRef);
	}

	public ngOnInit(): void {
		this.startTimer();
	}

	public ngOnDestroy(): void {
		this.timerSubscription?.unsubscribe();
	}

	public shouldDisableButton(): boolean {
		return this.remainingTime > 0;
	}

	public buttonClick(): void {
		this.confirmationEmailService.resendConfirmationEmail(this.data.optionalText?.email).subscribe(() => {
			this.startTimer();
		});
	}

	private startTimer(): void {
		this.remainingTime = 60;
		this.timerSubscription = timer(0, 1000)
			.pipe(takeWhile(() => this.remainingTime-- > 0))
			.subscribe();
	}
}
