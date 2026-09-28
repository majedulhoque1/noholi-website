
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "audit_log": {
                  Row: {
                    "action": string,"actor": string | null,"actor_role": string | null,"after": Json | null,"at": string,"before": Json | null,"entity": string,"entity_id": string | null,"id": number
                  }
                  Insert: {
                    "action": string,"actor"?: string | null,"actor_role"?: string | null,"after"?: Json | null,"at"?: string,"before"?: Json | null,"entity": string,"entity_id"?: string | null,"id"?: never
                  }
                  Update: {
                    "action"?: string,"actor"?: string | null,"actor_role"?: string | null,"after"?: Json | null,"at"?: string,"before"?: Json | null,"entity"?: string,"entity_id"?: string | null,"id"?: never
                  }
                  Relationships: [
                    
                  ]
                },"books": {
                  Row: {
                    "archived_at": string | null,"author": string,"author_bangla": string | null,"available_copies": number | null,"category": string | null,"category_raw": string | null,"condition": string | null,"condition_raw": string | null,"cover_source_url": string | null,"created_at": string,"donation_id": string | null,"edition": string | null,"genre": string | null,"genre_raw": string | null,"id": string,"is_circulating": boolean,"isbn": string | null,"issued_copies": number,"language": string | null,"location": string | null,"pages": number | null,"price": number | null,"publisher": string | null,"reserved_copies": number,"thumbnail": string | null,"title": string,"title_bangla": string | null,"total_copies": number,"updated_at": string,"year_of_publication": string | null
                  }
                  Insert: {
                    "archived_at"?: string | null,"author"?: string,"author_bangla"?: string | null,"available_copies"?: never,"category"?: string | null,"category_raw"?: string | null,"condition"?: string | null,"condition_raw"?: string | null,"cover_source_url"?: string | null,"created_at"?: string,"donation_id"?: string | null,"edition"?: string | null,"genre"?: string | null,"genre_raw"?: string | null,"id"?: string,"is_circulating"?: boolean,"isbn"?: string | null,"issued_copies"?: number,"language"?: string | null,"location"?: string | null,"pages"?: number | null,"price"?: number | null,"publisher"?: string | null,"reserved_copies"?: number,"thumbnail"?: string | null,"title": string,"title_bangla"?: string | null,"total_copies"?: number,"updated_at"?: string,"year_of_publication"?: string | null
                  }
                  Update: {
                    "archived_at"?: string | null,"author"?: string,"author_bangla"?: string | null,"available_copies"?: never,"category"?: string | null,"category_raw"?: string | null,"condition"?: string | null,"condition_raw"?: string | null,"cover_source_url"?: string | null,"created_at"?: string,"donation_id"?: string | null,"edition"?: string | null,"genre"?: string | null,"genre_raw"?: string | null,"id"?: string,"is_circulating"?: boolean,"isbn"?: string | null,"issued_copies"?: number,"language"?: string | null,"location"?: string | null,"pages"?: number | null,"price"?: number | null,"publisher"?: string | null,"reserved_copies"?: number,"thumbnail"?: string | null,"title"?: string,"title_bangla"?: string | null,"total_copies"?: number,"updated_at"?: string,"year_of_publication"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "books_donation_id_fkey"
      columns: ["donation_id"]
isOneToOne: true
      referencedRelation: "donations"
      referencedColumns: ["id"]
    }
                  ]
                },"borrow_requests": {
                  Row: {
                    "book_id": string,"book_title": string,"created_at": string,"decided_at": string | null,"decided_by": string | null,"expires_at": string,"guarantor_city": string | null,"guarantor_consent": boolean,"guarantor_district": string | null,"guarantor_email": string | null,"guarantor_name": string | null,"guarantor_nid": string | null,"guarantor_phone": string | null,"guarantor_postal_code": string | null,"guarantor_relationship": string | null,"guarantor_street": string | null,"id": string,"loan_id": string | null,"member_id": string,"member_name": string,"member_nid": string | null,"note": string | null,"pickup_date": string,"reason": string | null,"status": string
                  }
                  Insert: {
                    "book_id": string,"book_title": string,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"expires_at": string,"guarantor_city"?: string | null,"guarantor_consent"?: boolean,"guarantor_district"?: string | null,"guarantor_email"?: string | null,"guarantor_name"?: string | null,"guarantor_nid"?: string | null,"guarantor_phone"?: string | null,"guarantor_postal_code"?: string | null,"guarantor_relationship"?: string | null,"guarantor_street"?: string | null,"id"?: string,"loan_id"?: string | null,"member_id": string,"member_name": string,"member_nid"?: string | null,"note"?: string | null,"pickup_date": string,"reason"?: string | null,"status"?: string
                  }
                  Update: {
                    "book_id"?: string,"book_title"?: string,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"expires_at"?: string,"guarantor_city"?: string | null,"guarantor_consent"?: boolean,"guarantor_district"?: string | null,"guarantor_email"?: string | null,"guarantor_name"?: string | null,"guarantor_nid"?: string | null,"guarantor_phone"?: string | null,"guarantor_postal_code"?: string | null,"guarantor_relationship"?: string | null,"guarantor_street"?: string | null,"id"?: string,"loan_id"?: string | null,"member_id"?: string,"member_name"?: string,"member_nid"?: string | null,"note"?: string | null,"pickup_date"?: string,"reason"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "borrow_requests_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "books"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "borrow_requests_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "top_books_v"
      referencedColumns: ["book_id"]
    },{
      foreignKeyName: "borrow_requests_loan_fk"
      columns: ["loan_id"]
isOneToOne: false
      referencedRelation: "loan_status_v"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "borrow_requests_loan_fk"
      columns: ["loan_id"]
isOneToOne: false
      referencedRelation: "loans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "borrow_requests_loan_fk"
      columns: ["loan_id"]
isOneToOne: false
      referencedRelation: "overdue_list_v"
      referencedColumns: ["loan_id"]
    },{
      foreignKeyName: "borrow_requests_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "member_summary_v"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "borrow_requests_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"contact_messages": {
                  Row: {
                    "created_at": string,"email": string | null,"id": number,"ip_hash": string | null,"message": string,"name": string,"phone": string | null,"status": string,"subject": string | null
                  }
                  Insert: {
                    "created_at"?: string,"email"?: string | null,"id"?: never,"ip_hash"?: string | null,"message": string,"name": string,"phone"?: string | null,"status"?: string,"subject"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"email"?: string | null,"id"?: never,"ip_hash"?: string | null,"message"?: string,"name"?: string,"phone"?: string | null,"status"?: string,"subject"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"donations": {
                  Row: {
                    "assigned_accession_id": string | null,"book_author": string | null,"book_title": string,"condition": string | null,"created_at": string,"date_received": string,"donor_contact": string | null,"donor_name": string,"id": string,"notes": string | null,"rejection_reason": string | null,"review_status": string
                  }
                  Insert: {
                    "assigned_accession_id"?: string | null,"book_author"?: string | null,"book_title": string,"condition"?: string | null,"created_at"?: string,"date_received"?: string,"donor_contact"?: string | null,"donor_name": string,"id"?: string,"notes"?: string | null,"rejection_reason"?: string | null,"review_status"?: string
                  }
                  Update: {
                    "assigned_accession_id"?: string | null,"book_author"?: string | null,"book_title"?: string,"condition"?: string | null,"created_at"?: string,"date_received"?: string,"donor_contact"?: string | null,"donor_name"?: string,"id"?: string,"notes"?: string | null,"rejection_reason"?: string | null,"review_status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "donations_assigned_accession_fk"
      columns: ["assigned_accession_id"]
isOneToOne: true
      referencedRelation: "books"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "donations_assigned_accession_fk"
      columns: ["assigned_accession_id"]
isOneToOne: true
      referencedRelation: "top_books_v"
      referencedColumns: ["book_id"]
    }
                  ]
                },"fine_payments": {
                  Row: {
                    "amount": number,"fine_id": string,"id": string,"idempotency_key": string,"method": string,"note": string | null,"paid_at": string,"recorded_by": string | null,"reference": string | null
                  }
                  Insert: {
                    "amount": number,"fine_id": string,"id"?: string,"idempotency_key": string,"method": string,"note"?: string | null,"paid_at"?: string,"recorded_by"?: string | null,"reference"?: string | null
                  }
                  Update: {
                    "amount"?: number,"fine_id"?: string,"id"?: string,"idempotency_key"?: string,"method"?: string,"note"?: string | null,"paid_at"?: string,"recorded_by"?: string | null,"reference"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "fine_payments_fine_id_fkey"
      columns: ["fine_id"]
isOneToOne: false
      referencedRelation: "fines"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fine_payments_fine_id_fkey"
      columns: ["fine_id"]
isOneToOne: false
      referencedRelation: "loan_status_v"
      referencedColumns: ["fine_id"]
    }
                  ]
                },"fine_waivers": {
                  Row: {
                    "amount_waived": number,"fine_id": string,"id": number,"reason": string,"waived_at": string,"waived_by": string | null
                  }
                  Insert: {
                    "amount_waived": number,"fine_id": string,"id"?: never,"reason": string,"waived_at"?: string,"waived_by"?: string | null
                  }
                  Update: {
                    "amount_waived"?: number,"fine_id"?: string,"id"?: never,"reason"?: string,"waived_at"?: string,"waived_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "fine_waivers_fine_id_fkey"
      columns: ["fine_id"]
isOneToOne: true
      referencedRelation: "fines"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fine_waivers_fine_id_fkey"
      columns: ["fine_id"]
isOneToOne: true
      referencedRelation: "loan_status_v"
      referencedColumns: ["fine_id"]
    }
                  ]
                },"fines": {
                  Row: {
                    "amount": number,"amount_paid": number,"created_at": string,"days_overdue": number,"id": string,"kind": string,"loan_id": string,"member_id": string,"status": string,"updated_at": string
                  }
                  Insert: {
                    "amount": number,"amount_paid"?: number,"created_at"?: string,"days_overdue"?: number,"id"?: string,"kind"?: string,"loan_id": string,"member_id": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "amount"?: number,"amount_paid"?: number,"created_at"?: string,"days_overdue"?: number,"id"?: string,"kind"?: string,"loan_id"?: string,"member_id"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "fines_loan_id_fkey"
      columns: ["loan_id"]
isOneToOne: true
      referencedRelation: "loan_status_v"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fines_loan_id_fkey"
      columns: ["loan_id"]
isOneToOne: true
      referencedRelation: "loans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fines_loan_id_fkey"
      columns: ["loan_id"]
isOneToOne: true
      referencedRelation: "overdue_list_v"
      referencedColumns: ["loan_id"]
    },{
      foreignKeyName: "fines_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "member_summary_v"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fines_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"loans": {
                  Row: {
                    "accession_id": string,"book_id": string,"book_title": string,"closed_at": string | null,"created_at": string,"due_date": string,"guarantor_city": string | null,"guarantor_district": string | null,"guarantor_email": string | null,"guarantor_name": string | null,"guarantor_nid": string | null,"guarantor_phone": string | null,"guarantor_postal_code": string | null,"guarantor_relationship": string | null,"guarantor_street": string | null,"id": string,"issued_by": string | null,"issued_date": string,"member_id": string,"member_name": string,"notes": string | null,"renewal_count": number,"request_id": string | null,"return_date": string | null,"status": string
                  }
                  Insert: {
                    "accession_id": string,"book_id": string,"book_title": string,"closed_at"?: string | null,"created_at"?: string,"due_date": string,"guarantor_city"?: string | null,"guarantor_district"?: string | null,"guarantor_email"?: string | null,"guarantor_name"?: string | null,"guarantor_nid"?: string | null,"guarantor_phone"?: string | null,"guarantor_postal_code"?: string | null,"guarantor_relationship"?: string | null,"guarantor_street"?: string | null,"id"?: string,"issued_by"?: string | null,"issued_date"?: string,"member_id": string,"member_name": string,"notes"?: string | null,"renewal_count"?: number,"request_id"?: string | null,"return_date"?: string | null,"status"?: string
                  }
                  Update: {
                    "accession_id"?: string,"book_id"?: string,"book_title"?: string,"closed_at"?: string | null,"created_at"?: string,"due_date"?: string,"guarantor_city"?: string | null,"guarantor_district"?: string | null,"guarantor_email"?: string | null,"guarantor_name"?: string | null,"guarantor_nid"?: string | null,"guarantor_phone"?: string | null,"guarantor_postal_code"?: string | null,"guarantor_relationship"?: string | null,"guarantor_street"?: string | null,"id"?: string,"issued_by"?: string | null,"issued_date"?: string,"member_id"?: string,"member_name"?: string,"notes"?: string | null,"renewal_count"?: number,"request_id"?: string | null,"return_date"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "loans_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "books"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "top_books_v"
      referencedColumns: ["book_id"]
    },{
      foreignKeyName: "loans_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "member_summary_v"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_request_id_fkey"
      columns: ["request_id"]
isOneToOne: true
      referencedRelation: "borrow_requests"
      referencedColumns: ["id"]
    }
                  ]
                },"member_applications": {
                  Row: {
                    "city": string | null,"contacted": boolean,"created_at": string,"decided_at": string | null,"decided_by": string | null,"district": string | null,"email": string | null,"id": string,"ip_hash": string | null,"member_id": string | null,"name": string,"phone": string,"photo_path": string | null,"postal_code": string | null,"rejection_reason": string | null,"status": string,"street": string | null
                  }
                  Insert: {
                    "city"?: string | null,"contacted"?: boolean,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"district"?: string | null,"email"?: string | null,"id"?: string,"ip_hash"?: string | null,"member_id"?: string | null,"name": string,"phone": string,"photo_path"?: string | null,"postal_code"?: string | null,"rejection_reason"?: string | null,"status"?: string,"street"?: string | null
                  }
                  Update: {
                    "city"?: string | null,"contacted"?: boolean,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"district"?: string | null,"email"?: string | null,"id"?: string,"ip_hash"?: string | null,"member_id"?: string | null,"name"?: string,"phone"?: string,"photo_path"?: string | null,"postal_code"?: string | null,"rejection_reason"?: string | null,"status"?: string,"street"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "member_applications_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "member_summary_v"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "member_applications_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"members": {
                  Row: {
                    "address_line": string | null,"archived_at": string | null,"auth_user_id": string | null,"avatar": string | null,"city": string | null,"created_at": string,"default_guarantor_city": string | null,"default_guarantor_district": string | null,"default_guarantor_name": string | null,"default_guarantor_nid": string | null,"default_guarantor_phone": string | null,"default_guarantor_postal_code": string | null,"default_guarantor_relationship": string | null,"default_guarantor_street": string | null,"district": string | null,"email": string | null,"id": string,"merit_grade": string,"merit_note": string | null,"must_change_password": boolean,"name": string,"nid": string | null,"phone": string | null,"postal_code": string | null,"status": string,"updated_at": string
                  }
                  Insert: {
                    "address_line"?: string | null,"archived_at"?: string | null,"auth_user_id"?: string | null,"avatar"?: string | null,"city"?: string | null,"created_at"?: string,"default_guarantor_city"?: string | null,"default_guarantor_district"?: string | null,"default_guarantor_name"?: string | null,"default_guarantor_nid"?: string | null,"default_guarantor_phone"?: string | null,"default_guarantor_postal_code"?: string | null,"default_guarantor_relationship"?: string | null,"default_guarantor_street"?: string | null,"district"?: string | null,"email"?: string | null,"id"?: string,"merit_grade"?: string,"merit_note"?: string | null,"must_change_password"?: boolean,"name": string,"nid"?: string | null,"phone"?: string | null,"postal_code"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "address_line"?: string | null,"archived_at"?: string | null,"auth_user_id"?: string | null,"avatar"?: string | null,"city"?: string | null,"created_at"?: string,"default_guarantor_city"?: string | null,"default_guarantor_district"?: string | null,"default_guarantor_name"?: string | null,"default_guarantor_nid"?: string | null,"default_guarantor_phone"?: string | null,"default_guarantor_postal_code"?: string | null,"default_guarantor_relationship"?: string | null,"default_guarantor_street"?: string | null,"district"?: string | null,"email"?: string | null,"id"?: string,"merit_grade"?: string,"merit_note"?: string | null,"must_change_password"?: boolean,"name"?: string,"nid"?: string | null,"phone"?: string | null,"postal_code"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"settings": {
                  Row: {
                    "closed_weekdays": (number)[],"default_book_value": number,"fine_per_day": number,"hold_grace_days": number,"id": number,"loan_days": number,"max_items": number,"pickup_window_days": number,"renewal_days": number,"renewals_allowed": number,"timezone": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "closed_weekdays"?: (number)[],"default_book_value"?: number,"fine_per_day"?: number,"hold_grace_days"?: number,"id"?: number,"loan_days"?: number,"max_items"?: number,"pickup_window_days"?: number,"renewal_days"?: number,"renewals_allowed"?: number,"timezone"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "closed_weekdays"?: (number)[],"default_book_value"?: number,"fine_per_day"?: number,"hold_grace_days"?: number,"id"?: number,"loan_days"?: number,"max_items"?: number,"pickup_window_days"?: number,"renewal_days"?: number,"renewals_allowed"?: number,"timezone"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"staff_roles": {
                  Row: {
                    "created_at": string,"created_by": string | null,"role": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"role": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "fines_collected_v": {
                  Row: {
                    "amount_collected": number | null,"method": string | null,"month": string | null,"payments": number | null
                  }
                  Relationships: [
                    
                  ]
                },"loan_status_v": {
                  Row: {
                    "accession_id": string | null,"book_id": string | null,"book_title": string | null,"closed_at": string | null,"created_at": string | null,"days_overdue": number | null,"derived_status": string | null,"due_date": string | null,"fine_amount": number | null,"fine_balance": number | null,"fine_id": string | null,"fine_is_accruing": boolean | null,"fine_paid": number | null,"fine_status": string | null,"guarantor_city": string | null,"guarantor_district": string | null,"guarantor_email": string | null,"guarantor_name": string | null,"guarantor_nid": string | null,"guarantor_phone": string | null,"guarantor_postal_code": string | null,"guarantor_relationship": string | null,"guarantor_street": string | null,"id": string | null,"issued_by": string | null,"issued_date": string | null,"member_id": string | null,"member_name": string | null,"notes": string | null,"renewal_count": number | null,"request_id": string | null,"return_date": string | null,"status": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "loans_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "books"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "top_books_v"
      referencedColumns: ["book_id"]
    },{
      foreignKeyName: "loans_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "member_summary_v"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_request_id_fkey"
      columns: ["request_id"]
isOneToOne: true
      referencedRelation: "borrow_requests"
      referencedColumns: ["id"]
    }
                  ]
                },"loans_per_month_v": {
                  Row: {
                    "cancelled": number | null,"loans_issued": number | null,"lost": number | null,"month": string | null,"returned": number | null,"still_active": number | null
                  }
                  Relationships: [
                    
                  ]
                },"member_summary_v": {
                  Row: {
                    "accruing_fines": number | null,"active_holds": number | null,"active_loans": number | null,"address_line": string | null,"archived_at": string | null,"auth_user_id": string | null,"avatar": string | null,"city": string | null,"created_at": string | null,"default_guarantor_city": string | null,"default_guarantor_district": string | null,"default_guarantor_name": string | null,"default_guarantor_nid": string | null,"default_guarantor_phone": string | null,"default_guarantor_postal_code": string | null,"default_guarantor_relationship": string | null,"default_guarantor_street": string | null,"district": string | null,"email": string | null,"id": string | null,"merit_grade": string | null,"merit_note": string | null,"must_change_password": boolean | null,"name": string | null,"nid": string | null,"outstanding_fines": number | null,"overdue_loans": number | null,"phone": string | null,"postal_code": string | null,"status": string | null,"updated_at": string | null
                  }
                  Insert: {
                           "accruing_fines"?: never,"active_holds"?: never,"active_loans"?: never,"address_line"?: string | null,"archived_at"?: string | null,"auth_user_id"?: string | null,"avatar"?: string | null,"city"?: string | null,"created_at"?: string | null,"default_guarantor_city"?: string | null,"default_guarantor_district"?: string | null,"default_guarantor_name"?: string | null,"default_guarantor_nid"?: string | null,"default_guarantor_phone"?: string | null,"default_guarantor_postal_code"?: string | null,"default_guarantor_relationship"?: string | null,"default_guarantor_street"?: string | null,"district"?: string | null,"email"?: string | null,"id"?: string | null,"merit_grade"?: string | null,"merit_note"?: string | null,"must_change_password"?: boolean | null,"name"?: string | null,"nid"?: string | null,"outstanding_fines"?: never,"overdue_loans"?: never,"phone"?: string | null,"postal_code"?: string | null,"status"?: string | null,"updated_at"?: string | null
                         }
                        Update: {
                           "accruing_fines"?: never,"active_holds"?: never,"active_loans"?: never,"address_line"?: string | null,"archived_at"?: string | null,"auth_user_id"?: string | null,"avatar"?: string | null,"city"?: string | null,"created_at"?: string | null,"default_guarantor_city"?: string | null,"default_guarantor_district"?: string | null,"default_guarantor_name"?: string | null,"default_guarantor_nid"?: string | null,"default_guarantor_phone"?: string | null,"default_guarantor_postal_code"?: string | null,"default_guarantor_relationship"?: string | null,"default_guarantor_street"?: string | null,"district"?: string | null,"email"?: string | null,"id"?: string | null,"merit_grade"?: string | null,"merit_note"?: string | null,"must_change_password"?: boolean | null,"name"?: string | null,"nid"?: string | null,"outstanding_fines"?: never,"overdue_loans"?: never,"phone"?: string | null,"postal_code"?: string | null,"status"?: string | null,"updated_at"?: string | null
                         }
                        Relationships: [
                    
                  ]
                },"overdue_list_v": {
                  Row: {
                    "accruing_fine": number | null,"book_id": string | null,"book_title": string | null,"days_overdue": number | null,"due_date": string | null,"guarantor_name": string | null,"guarantor_phone": string | null,"issued_date": string | null,"loan_id": string | null,"member_email": string | null,"member_id": string | null,"member_name": string | null,"member_phone": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "loans_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "books"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "top_books_v"
      referencedColumns: ["book_id"]
    },{
      foreignKeyName: "loans_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "member_summary_v"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "members"
      referencedColumns: ["id"]
    }
                  ]
                },"top_books_v": {
                  Row: {
                    "author": string | null,"book_id": string | null,"last_borrowed": string | null,"times_borrowed": number | null,"title": string | null,"title_bangla": string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "add_donation_to_inventory":
{ Args: { "_donation_id": string }; Returns: string
                           },
"adjust_stock":
{ Args: { "p_book_id": string,"p_new_total": number,"p_reason": string }; Returns: Json
                           },
"approve_application":
{ Args: { "p_application_id": string }; Returns: string
                           },
"cancel_my_request":
{ Args: { "p_request_id": string }; Returns: Json
                           },
"catalog_facets":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"complete_password_change":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"current_member_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"expire_holds":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"extend_loan":
{ Args: { "p_loan_id": string,"p_new_due_date": string }; Returns: Json
                           },
"fine_for":
{ Args: { "p_due": string,"p_on": string,"p_price": number }; Returns: number
                           },
"fmt_id":
{ Args: { "p_n": number,"p_prefix": string,"p_width": number }; Returns: string
                           },
"get_public_settings":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"intake_submit":
{ Args: { "p_ip_hash": string,"p_kind": string,"p_payload": Json }; Returns: Json
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"issue_from_request":
{ Args: { "p_due_date"?: string,"p_notes"?: string,"p_request_id": string }; Returns: Json
                           },
"issue_loan":
{ Args: { "p_book_id": string,"p_due_date"?: string,"p_guarantor_city"?: string,"p_guarantor_district"?: string,"p_guarantor_email"?: string,"p_guarantor_name"?: string,"p_guarantor_nid"?: string,"p_guarantor_phone"?: string,"p_guarantor_postal_code"?: string,"p_guarantor_relationship"?: string,"p_guarantor_street"?: string,"p_member_id": string,"p_notes"?: string }; Returns: Json
                           },
"link_member_login":
{ Args: { "p_action"?: string,"p_actor": string,"p_member_id": string,"p_user_id": string }; Returns: Json
                           },
"list_staff":
{ Args: Record<PropertyKey, never>; Returns: {
              "created_at": string,"email": string,"last_sign_in_at": string,"mfa_enabled": boolean,"role": string,"user_id": string
            }[]
                           },
"mark_lost":
{ Args: { "p_loan_id": string,"p_note"?: string }; Returns: Json
                           },
"my_role":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"next_open_day":
{ Args: { "p_date": string }; Returns: string
                           },
"purge_rejected_applications":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"record_fine_payment":
{ Args: { "p_amount": number,"p_fine_id": string,"p_idempotency_key": string,"p_method": string,"p_note"?: string,"p_reference"?: string }; Returns: Json
                           },
"reject_application":
{ Args: { "p_application_id": string,"p_reason": string }; Returns: Json
                           },
"reject_request":
{ Args: { "p_reason": string,"p_request_id": string }; Returns: Json
                           },
"remove_staff":
{ Args: { "p_user_id": string }; Returns: undefined
                           },
"renew_my_loan":
{ Args: { "p_loan_id": string }; Returns: Json
                           },
"resolve_login":
{ Args: { "identifier": string }; Returns: string
                           },
"return_loan":
{ Args: { "p_loan_id": string,"p_return_date"?: string }; Returns: Json
                           },
"search_books":
{ Args: { "category"?: string,"genre"?: string,"language"?: string,"page"?: number,"page_size"?: number,"q"?: string }; Returns: Database["public"]['CompositeTypes']["book_card"][]
                          SetofOptions: {
        from: "*"
        to: "book_card"
        isOneToOne: false
        isSetofReturn: true
      } },
"submit_borrow_request":
{ Args: { "p_book_id": string,"p_consent": boolean,"p_guarantor_city"?: string,"p_guarantor_district"?: string,"p_guarantor_email"?: string,"p_guarantor_name"?: string,"p_guarantor_nid"?: string,"p_guarantor_phone"?: string,"p_guarantor_postal_code"?: string,"p_guarantor_relationship"?: string,"p_guarantor_street"?: string,"p_member_nid"?: string,"p_note"?: string,"p_pickup_date": string }; Returns: Json
                           },
"today_dhaka":
{ Args: { "p_at"?: string }; Returns: string
                           },
"update_my_profile":
{ Args: { "p_address_line"?: string,"p_avatar"?: string,"p_city"?: string,"p_district"?: string,"p_phone"?: string,"p_postal_code"?: string }; Returns: Json
                           },
"update_settings":
{ Args: { "p_closed_weekdays"?: (number)[],"p_default_book_value"?: number,"p_fine_per_day"?: number,"p_hold_grace_days"?: number,"p_loan_days"?: number,"p_max_items"?: number,"p_pickup_window_days"?: number,"p_renewal_days"?: number,"p_renewals_allowed"?: number }; Returns: Json
                           },
"void_loan":
{ Args: { "p_loan_id": string,"p_reason": string }; Returns: Json
                           },
"waive_fine":
{ Args: { "p_fine_id": string,"p_reason": string }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            "book_card": {
                        "id": string | null,"title": string | null,"title_bangla": string | null,"author": string | null,"author_bangla": string | null,"genre": string | null,"category": string | null,"language": string | null,"publisher": string | null,"year_of_publication": string | null,"edition": string | null,"isbn": string | null,"pages": number | null,"condition": string | null,"thumbnail": string | null,"is_circulating": boolean | null,"total_copies": number | null,"available_copies": number | null,"total_count": number | null
                      }
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const

