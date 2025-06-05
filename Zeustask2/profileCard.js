function createProfileCard() {
  return `
    <div class="profile-card" style="display: flex; align-items: center; background-color: rgba(255,255,255,1); padding: 10px; margin-top: 390px;">
      <div class="profile-photo" style="margin-right: 20px;">
        <img src="profile_phot.PNG" alt="Profile Photo" style="display: block; max-width: 120px;" />
      </div>
      <div class="profile-details" style="padding-right: 5px;">
        <b class="username" style="font-size: 18px; position: relative; top: 20px;">@moshhemadani</b>
        <p class="address" style="font-weight: 525; position: relative; top: 12px;">I'd love to teach you HTML/CSS !!!</p>
        <p style="color: rgba(197,197,197,1); position: relative; top: 12px; font-weight: 500;">
          <i class="fa-regular fa-comment" style="padding: 5px; transform: scaleX(-1);"></i> 242
          <i class="fa-solid fa-retweet" style="padding-left: 20px; padding-right: 5px;"></i> 142
          <i class="fa-regular fa-heart" style="padding-left: 20px; padding-right: 5px;"></i> 2.6k
        </p>
      </div>
    </div>
  `;
}