const SMTPConnection = require("smtp-connection");

async function verifyMailbox(mxHost, email) {
  return new Promise((resolve) => {
    const connection = new SMTPConnection({
      host: mxHost,
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 8000
    });

    let resolved = false;

    function safeResolve(result) {
      if (!resolved) {
        resolved = true;
        try {
          connection.quit();
        } catch (e) {}
        resolve(result);
      }
    }

    connection.connect((err) => {
      if (err) {
        return safeResolve({
          status: "unknown",
          subresult: "connection_error",
          smtpCode: null,
          error: err.message
        });
      }

      connection.mail(
        { from: "verify@test.com" },
        (err) => {
          if (err) {
            return safeResolve({
              status: "unknown",
              subresult: "mail_from_rejected",
              smtpCode: err.responseCode || null,
              error: err.message
            });
          }

          connection.rcpt(
            { to: email },
            (err) => {
              if (!err) {
                return safeResolve({
                  status: "valid",
                  subresult: "mailbox_exists",
                  smtpCode: 250,
                  error: null
                });
              }

              const code = err.responseCode;

              if (code >= 500 && code < 600) {
                return safeResolve({
                    status: "invalid",
                    subresult: "mailbox_rejected",
                    smtpCode: code,
                    error: null
                });
              }

              if (code >= 400 && code < 500) {
                return safeResolve({
                    status: "unknown",
                    subresult: "temporary_failure",
                    smtpCode: code,
                    error: null
                });
              }

              return safeResolve({
                status: "unknown",
                subresult: "smtp_error",
                smtpCode: code || null,
                error: err.message
              });
            }
          );
        }
      );
    });

    connection.on("error", (err) => {
      safeResolve({
        status: "unknown",
        subresult: "connection_error",
        smtpCode: null,
        error: err.message
      });
    });

    connection.on("timeout", () => {
      safeResolve({
        status: "unknown",
        subresult: "timeout",
        smtpCode: null,
        error: "connection_timeout"
      });
    });
  });
}

module.exports = verifyMailbox;
