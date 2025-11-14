import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Zone, PharmacyState, CustomerType } from 'src/app/models/pharmacy.model';
import { ZoneService } from 'src/app/services/api/zone.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-pharmacies-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pharmacies.form-modal.html',
  styleUrls: ['./pharmacies.form-modal.scss']
})
export class PharmaciesFormModalComponent implements OnInit {
  @Input() title = 'Pharmacy';
  @Input() value: any = null;

  form: FormGroup;
  zones: Zone[] = [];
  PharmacyState = PharmacyState;
  CustomerType = CustomerType;
  isLoading = false;

  constructor(private fb: FormBuilder, public activeModal: NgbActiveModal, private zoneService: ZoneService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      type: ['', [Validators.required, Validators.maxLength(40)]],
      address: ['', [Validators.required, Validators.maxLength(160)]],
      managerName: ['', [Validators.maxLength(80)]],
      doctorName: ['', [Validators.maxLength(80)]]
    });
  }

  ngOnInit() {
    this.loadZones();
    if (this.value) {
      this.form.patchValue({
        name: this.value.name,
        phoneNumber: this.value.phoneNumber,
        code: this.value.code,
        type: this.value.type,
        address: this.value.address,
        managerName: this.value.managerName,
        doctorName: this.value.doctorName
      });
    }
  }

  private loadZones() {
    this.isLoading = true;
    this.zoneService.getAll()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (zones) => this.zones = zones,
        error: (err) => console.error('Failed to load zones', err)
      });
  }

  submit() {
    if (this.form.invalid) return;
    this.activeModal.close(this.form.value);
  }

  cancel() {
    this.activeModal.dismiss();
  }
}
