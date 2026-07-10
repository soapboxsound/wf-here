const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { Resend } = require("resend");

initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");
const adminEmail = defineString("ADMIN_EMAIL");
const fromEmail = defineString("FROM_EMAIL", {
  default: "WF-Here <onboarding@resend.dev>"
});
const siteUrl = defineString("SITE_URL", {
  default: "https://wf-here.com"
});

const cityLabels = {
  "new-york": "New York",
  "los-angeles": "Los Angeles"
};

function formatCity(city = "") {
  return cityLabels[city] || city;
}

async function sendEmail({ to, subject, html }) {
  const resend = new Resend(resendApiKey.value());
  await resend.emails.send({
    from: fromEmail.value(),
    to: [to],
    subject,
    html
  });
}

exports.notifyAdminNewSubmission = onDocumentCreated(
  {
    document: "submissions/{submissionId}",
    secrets: [resendApiKey]
  },
  async (event) => {
    const submission = event.data?.data();

    if (!submission || submission.status !== "pending") {
      return;
    }

    const to = adminEmail.value();

    if (!to) {
      console.warn("ADMIN_EMAIL is not set. Skipping admin notification.");
      return;
    }

    const queueUrl = `${siteUrl.value()}/admin/queue`;
    const spotName = submission.name || "Untitled spot";

    await sendEmail({
      to,
      subject: `New WF-Here submission — ${spotName}`,
      html: `
        <p>A new spot was submitted and is waiting for review.</p>
        <p><strong>${spotName}</strong></p>
        <p>City: ${formatCity(submission.city)}</p>
        <p>Address: ${submission.address || "—"}</p>
        <p>Wifi network: ${submission.wifiNetwork || "—"}</p>
        <p>Submitted by: ${submission.submitterEmail || submission.submitterName || "anonymous"}</p>
        <p><a href="${queueUrl}">Open review queue</a></p>
      `
    });
  }
);

exports.notifySubmitterApproved = onDocumentUpdated(
  {
    document: "submissions/{submissionId}",
    secrets: [resendApiKey]
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) {
      return;
    }

    if (before.status === after.status || after.status !== "approved") {
      return;
    }

    const submitterEmail = after.submitterEmail;

    if (!submitterEmail) {
      return;
    }

    const spotName = after.name || "Your spot";
    const slug = after.slug || "";
    const placeUrl = slug
      ? `${siteUrl.value()}/place?slug=${encodeURIComponent(slug)}`
      : `${siteUrl.value()}/explore/new-york`;

    await sendEmail({
      to: submitterEmail,
      subject: "Your spot is on the map — wf—here",
      html: `
        <p>Good news. <strong>${spotName}</strong> has been reviewed and is now live on wf—here.</p>
        <p><a href="${placeUrl}">View your spot on the map</a></p>
        <p>Thanks for contributing.</p>
      `
    });
  }
);
