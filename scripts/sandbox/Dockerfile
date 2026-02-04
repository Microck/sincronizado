FROM ubuntu:22.04

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    openssh-server ca-certificates tmux git curl \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /var/run/sshd \
  && ssh-keygen -A

RUN useradd -m -s /bin/bash sinc \
  && mkdir -p /home/sinc/.ssh \
  && chmod 700 /home/sinc/.ssh

# The sandbox script generates this file before building.
COPY .sandbox/authorized_keys /home/sinc/.ssh/authorized_keys

RUN chown -R sinc:sinc /home/sinc/.ssh \
  && chmod 600 /home/sinc/.ssh/authorized_keys \
  && sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config \
  && sed -i 's/^#\?PubkeyAuthentication .*/PubkeyAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config

RUN mkdir -p /home/sinc/workspace \
  && chown -R sinc:sinc /home/sinc/workspace

# Stub agent commands so demos don't require real installs.
RUN printf '%s\n' \
  '#!/usr/bin/env bash' \
  'echo "opencode (sandbox stub)"' \
  'exec bash' \
  > /usr/local/bin/opencode \
  && chmod +x /usr/local/bin/opencode

RUN printf '%s\n' \
  '#!/usr/bin/env bash' \
  'echo "claude (sandbox stub)"' \
  'exec bash' \
  > /usr/local/bin/claude \
  && chmod +x /usr/local/bin/claude

EXPOSE 22

CMD ["/usr/sbin/sshd","-D","-e"]
