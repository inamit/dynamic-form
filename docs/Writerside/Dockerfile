# Stage 1: Build the documentation
FROM registry.jetbrains.team/p/writerside/builder/writerside-builder:241.15989 AS builder

ARG INSTANCE=Writerside/hi
ENV INSTANCE=$INSTANCE

WORKDIR /opt/builder

# Copy the Writerside source directory
COPY docs/Writerside /opt/project/docs/Writerside

# Build the documentation
RUN export DISPLAY=:99 && \
    Xvfb :99 & \
    /opt/builder/bin/idea.sh helpbuilderinspect -source-dir /opt/project -project-dir /opt/project/docs/Writerside -runner always -output-dir /opt/project/artifacts/docs || true

# Stage 2: Serve the documentation with Nginx
FROM nginx:alpine

# Copy the built artifacts from the builder stage
# Note: Writerside builder outputs an archive, or direct HTML depending on flags.
# Assuming standard output directory is populated:
COPY --from=builder /opt/project/artifacts/docs /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
