# Noholi OS: staff guide

This guide is for library staff. It explains the everyday jobs in Noholi OS, the library's staff system.

- Open Noholi OS at: **`<OS address>`**
- Sign in with your **email** and **password**.
- If you do nothing for 30 minutes, the system signs you out. Just sign in again.
- Members can't use Noholi OS. They use the library website.

The menu on the left has: **Dashboard, Inventory, Lending, Members, Book Donations, Messages, Fines, Settings**.
Administrators who have verified two-factor sign-in also see **Reports**.

Small icons in a table row show their name when you hold the mouse over them.
The **⋮** (three dots) button at the end of a row opens more actions.

## The library rules (the system applies these for you)

- A loan lasts **14 days**.
- A member can have **5 items** at once. Loans and website holds both count.
- A late book costs **৳10 per day**. The fine never goes above the book's price. If the book has no price, the limit is **৳200**.
- A member can renew a loan **once** on the website.
- A website hold lasts until the pickup date **plus 2 days**. Then it ends by itself.
- A member **can't borrow** while their membership is not Active, while they have an overdue book, or while they owe a fine.

An administrator can change these numbers in **Settings → Policy**.

---

## How to issue a book

1. Click **Lending** in the menu.
2. Find the **Issue Book** box at the top.
3. **1. Member**: click **Search member…**. Type a name, member ID, phone or email. Click the member.
   - Green text means the member can borrow.
   - Red text means they can't. For example: "Member has 1 overdue book", "Member has an unpaid fine of ৳40", or the item limit is reached.
     Sort that out first (see *Return a book and take a fine*).
4. **2. Book**: click **Search book or ID…**. Type the title or author (English or বাংলা), the ISBN, or the book ID. Click the book.
   - A greyed-out book has no free copy, or is **Reading room** only. It can't be lent.
5. **Due Date**: it is filled in for you (14 days). Change it only if you need to.
   If the date falls on a day the library is closed, the system moves it to the next open day.
6. **3. Guarantor Details**: if the member has a saved guarantor, it is filled in already. Check it with the member.
   These fields are required: **Full Name**, **Phone**, **Relationship**, **Street Address**, **City / Area**, **District**.
7. Tick **I confirm the guarantor is responsible for this borrowing.**
8. Click **Confirm Issue**.
9. A message shows the new loan number (for example LN-0042) and the due date. The loan appears under the **Active** tab.

If the member asked for this book on the website, don't use Issue Book. Use the **Web Requests** tab instead (see below).

---

## Return a book and take a fine

### Return the book
1. Go to **Lending**. Stay on the **Active** tab, or use **Overdue** for late books.
2. Search for the member, the book or the loan number with **Search loans...**.
3. Click the **Return** icon (the circular arrow) on the loan row.
4. **Return date** is today. If the book actually came back on an earlier day, pick that day.
5. Click **Confirm Return**.
6. If the book was on time, you're done. If it was late, the message shows the fine number and amount (for example "Fine FN-0007: ৳30").

### Take the fine
1. Click **Fines** in the menu. The **Open** filter shows every fine that still needs attention.
2. Find the fine. You can search by member, book, fine number or loan number.
3. Click the **Record Payment** icon (the money sign).
4. **Amount Paid (৳)** is filled with the full amount due. If the member pays only part, type the smaller amount. The fine then stays "Partially Paid".
5. Choose the **Payment Method**: Cash, bKash, Nagad, Bank Transfer, Card or Other.
6. Optional: type a **Reference / Receipt No.** (for example the bKash transaction ID) and a **Note**.
7. Click **Confirm Payment**. The fine changes to **Paid** when nothing is left to pay.

Good to know:
- A book that is still out and late shows a fine that is still **accruing**, marked "not payable yet". You can take the money only after the book is returned (or marked lost).
- Only an **administrator** can cancel (waive) a fine: ⋮ → **Waive fine**, with a reason. Administrators must have verified two-factor sign-in first.

### A book is lost
1. In **Lending**, open the loan's **⋮** menu and choose **Mark Lost**. Add a note if you like, then click **Mark Lost**.
2. The book is taken out of stock. The member is charged the book's price, or ৳200 if it has no price.
3. Take the payment in **Fines** as above.

### A loan was entered by mistake
In **Lending**, open the loan's **⋮** menu and choose **Void Loan**. Type a reason (required) and click **Void Loan**.
The book goes back on the shelf and any fine is cancelled. You can't void a loan whose fine has already been paid, in full or in part.

---

## Approve a membership application

People apply on the website ("Become a member"). Their applications wait for you.

1. Click **Members** in the menu. Open the **Applications** tab. A red number shows how many are waiting.
2. The **Pending** filter shows new applications. Click the photo to see it bigger.
3. **Phone the applicant first.** Then tick **Contacted** on their row.
4. To accept: click **Approve**, then **Approve & create login**.
   - The person becomes an Active member with a member ID (for example MEM-0123).
   - A box shows their **Member ID** and a **Temporary password**.
   - **This password is shown only once.** Tell it to the member by phone now. Click **Copy** if that helps.
   - Click **Done, I've passed it on**.
5. To refuse: click **Reject**, type a **Reason**, and click **Reject**.
   Rejected applications and their photos are deleted after 90 days.

If approval worked but the login failed, you will see a message about it. Go to the **Members** tab, find the new member,
open **⋮** and choose **Create login**.

To add a member yourself (someone at the desk): **Members** → **Add Member**. Afterwards, use **⋮ → Create login** to give them website access.

---

## Handle a borrow request from the website

Members can ask for a book on the website and choose a pickup date. The system keeps one copy aside for them.

1. Go to **Lending** and open the **Web Requests** tab. The number shows how many are waiting.
2. Each row shows the member, the book, the **Pickup** date, **Hold until**, time left, and the guarantor.
   - A red "No consent recorded" under the guarantor means you should check with the member before lending.
3. When the member comes to collect the book:
   - Click the **Issue** icon (the book with a tick), then click **Issue**.
   - The loan is due in 14 days, and the guarantor from the request is used.
4. If you can't lend it (for example, the copy is damaged):
   - Click the **Reject** icon (the X). Type a **Reason**. The member will see it. Click **Reject Request**.
   - The copy is freed for others.
5. If nobody comes, the hold ends by itself after the "Hold until" date. An expired hold can't be issued.
   The member must make a new request.
6. The list refreshes every minute. Click **Refresh** to update it now.

The bell icon at the top also tells you about new requests and holds that end tonight.

---

## Renew / edit a loan

**Members renew by themselves** on the website, once per loan. You don't need to do anything.

### Give more time (staff)
1. In **Lending**, open the loan's **⋮** menu and choose **Extend Due Date**.
2. Pick a **New Due Date**, or click **+7 days** or **+14 days**.
3. Click **Extend**.
An extension is not counted as the member's renewal. The new date must be later than the current due date, and not in the past.

### Fix the guarantor or notes
1. In **Lending**, open the loan's **⋮** menu and choose **Edit Details**.
2. Correct the guarantor's name, relationship, phone, email, address or postal code, or the **Notes**.
   - To change the guarantor's NID, type the new one. Leave it blank to keep the current NID.
3. Click **Save changes**.
You can't change the book, the member or the dates here. Use **Extend Due Date** for dates, or **Void Loan** if the loan is wrong.

### See the full loan
Click a loan row, or the **View** icon (the eye), to see the member, the book, the dates, renewals, the fine and the guarantor.

---

## Messages inbox

Messages from the website's Contact form arrive here.

1. Click **Messages** in the menu. The **Inbox** filter shows new and read messages. New ones are in bold.
2. Click a message to read it. It is marked as read.
3. To answer:
   - **Reply by email** opens your email program with a reply ready.
   - Click the phone number (or **Call**) to call them.
4. When it's dealt with, click **Archive (handled)**.
5. Other buttons: **Mark unread** (to come back to it later) and **Move to inbox** (for an archived message).
6. Use the search box to find a name, email, phone number or words in the message.

Replies are sent from your own email program. Noholi OS does not send emails.

---

## Settings: policy and staff

Open **Settings** in the menu. It has five sections: **Policy, Account, Staff, Activity log, Backup**.

### Policy
- Everyone can see the library rules here.
- Only an **administrator with verified two-factor sign-in** can change them.
- To change them: edit the numbers (Loan length, Items per member, Late fine, Default book value, Hold grace,
  Pickup window, Self-renewals, Renewal length). Under **Opening days**, tick the days the library is **closed**. Then click **Save policy**.
- New values apply from now on. Existing due dates don't change.

### Staff (administrators only)
**Add a staff member**
1. Under **Add staff**, type their **Email** and choose the **Role**: **Staff** or **Administrator**.
2. Click **Create staff login**.
3. A box shows the email and a **temporary password**, shown only once. Give it to them in person or by phone.
4. Ask them to sign in and change the password at once in **Settings → Account → Change password**. The system does not force staff to do this.

**Remove a staff member**
Click **Remove** on their row, then **Remove** again. They can no longer use Noholi OS. You can't remove yourself.

### Account
Shows your email and role. Change your own password here (at least 8 characters): fill in **New password** and **Confirm new password**, then click **Update password**.

### Activity log
Every action by staff (loans, returns, payments, edits, settings) is recorded here. You can search it. Nobody can change it.

### Backup
Backups happen every night by themselves. There's nothing to do on this screen.

---

## Set up your 2FA (admins)

Administrators must use two-factor sign-in, a 6-digit code from an app on your phone. Until you do, the admin tools stay locked:
policy, staff, and waiving fines. Normal desk work still works.

**First time**
1. Install an authenticator app on your phone, for example Google Authenticator, Microsoft Authenticator or 2FAS.
2. Sign in to Noholi OS. A **Two-factor sign-in** box opens by itself.
   If you closed it, click **Verify now** in the yellow bar at the top, or go to **Settings → Account → Set up authenticator**.
3. In the app, add a new account and scan the QR code. If you can't scan it, type the key shown under "Can't scan?".
4. Type the 6-digit code from the app and click **Verify**.
5. You'll see "Verified. Admin tools are unlocked for this session."

**Every time after that**
Each time you sign in, the box asks for the current 6-digit code. Type it and click **Verify**.
If the code is refused, check that the time on your phone is correct and use the newest code.

**Lost or new phone?** You can't reset this yourself. Ask the technical maintainer to remove your old authenticator.
Then sign in and set it up again. Tip: the library should always have **two** administrators.

---

## A member forgot their password

Members can't reset their password on the website. The website tells them to contact the library.

1. Make sure it's really the member (in person, or by phone with their details).
2. Go to **Members**. Search for their name, member ID, phone, or the last 4 digits of their NID.
3. Open **⋮** on their row and choose **Reset login**, then click **Reset password**.
   (You can also click **View** on the member, then **Reset login**.)
4. A box shows their **Member ID** and a new **Temporary password**. It is shown only once.
   Tell them by phone or in person. Click **Done, I've passed it on**.
5. The member signs in on the website with their **member ID** and the temporary password. The website then makes them choose a new password.

Their old password stops working immediately.
If the row shows **Create login** instead, the member never had a website login. Choose it to make one.
The member's row shows "Login · temp pw" until they have chosen their own password.

**A staff member forgot their password?** Noholi OS can't reset staff passwords. Ask the technical maintainer.
