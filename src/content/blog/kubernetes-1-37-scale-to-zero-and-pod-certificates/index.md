---
title: "Kubernetes 1.37: Two Features That Caught My Attention"
summary: "HPA scale-to-zero and native Pod Certificates make Kubernetes 1.37 an especially interesting release for efficient, secure cloud-native platforms."
date: "September 7 2026"
draft: false
tags:
- kubernetes
- platform-engineering
- cloud-native
- security
- autoscaling
---

Kubernetes 1.37 is a substantial release, with [67 enhancements across Stable, Beta, and Alpha](https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/). Two changes stand out to me from a platform-engineering perspective: HorizontalPodAutoscaler (HPA) scale-to-zero and native Pod Certificates.

One is about making idle capacity disappear. The other is about making workload identity stronger. Together, they speak to two constant platform concerns: **efficiency** and **security**.

## 1. HPA scale-to-zero

With Kubernetes 1.37, HPA scale-to-zero is **Beta and enabled by default**. An HPA using an object or external metric can now set `minReplicas: 0`, allowing a workload to scale down completely when it is idle and return when demand appears. [The Kubernetes HPA documentation](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/#scaling-to-and-from-zero) has the details.

```text
10 → 5 → 1 → 0
          ↓
     Work arrives
          ↓
0 → 1 → 5 → 10
```

The important part is the signal used to wake the workload. CPU and memory metrics are measured from running Pods, so they cannot tell HPA to restart a workload that is already at zero. Scale-to-zero therefore requires at least one **object or external metric** — for example, queue depth, pending jobs, or a custom business metric.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: queue-worker
spec:
  minReplicas: 0
  maxReplicas: 10
  metrics:
    - type: External
      external:
        metric:
          name: queue_consumer_lag
        target:
          type: Value
          value: "30"
```

This is particularly compelling for:

- Queue consumers that can wait for work in a durable queue
- Event-driven and batch processing workloads
- Preview environments that spend long periods idle
- GPU-backed inference workers, where an idle Pod can reserve expensive capacity

The cost implication is refreshingly simple: **no workload does not have to mean running Pods**.

There are a few operational details worth planning for. HPA records a `ScaledToZero=True` status condition when *it* brings a workload to zero, which lets it distinguish that state from a manually paused workload. The usual scale-down stabilization window still applies, and a metrics adapter must remain available while the workload is asleep. Also, a Kubernetes Service does not queue HTTP traffic for a workload with no ready Pods; request-driven services need a buffering layer or a cold-start experience that users can tolerate. The [feature announcement](https://kubernetes.io/blog/2026/09/02/kubernetes-v1-37-hpa-scale-to-zero-beta/) is an excellent practical guide.

## 2. Pod Certificates and Cluster Trust Bundles

Kubernetes 1.37 also makes **Pod Certificates** and the related **Cluster Trust Bundles** stable. This introduces first-class Kubernetes primitives for delivering private keys, X.509 certificate chains, and trust anchors to Pods through projected volumes.

```text
Pod A ─── mTLS ─── Pod B
  │                 │
  └── X.509 identity ──┘
```

At a high level, an application requests a certificate in its Pod spec. Kubelet generates the private key, creates a `PodCertificateRequest`, and writes the issued certificate material into the projected volume. A signer controller issues certificates and publishes the corresponding trust bundles. Kubelet also refreshes the files, so applications need to handle certificate rotation correctly.

This gives workloads a strong, cryptographic identity that can be used for TLS and mutual TLS (mTLS). It is a useful building block for service-to-service authentication, especially where a platform wants identity that is closer to the workload than a long-lived shared secret.

One subtle but important point: Kubernetes provides the machinery, but it does **not** ship a production Pod Certificate signer in core. Teams still need to choose or operate a compatible signer and configure their applications to load and rotate the certificate material. The [official Pod Certificates overview](https://kubernetes.io/blog/2026/08/28/kubernetes-v1-37-pod-certificates-and-cluster-trust-bundles/) explains the architecture and its security model.

## Why these features matter together

The two features solve different problems, but they point in the same direction:

| Capability | Platform outcome |
| --- | --- |
| HPA scale-to-zero | Lower idle cost and less wasted capacity |
| Pod Certificates | Stronger workload identity and a native basis for mTLS |

For platform teams, this is a meaningful combination. We want applications to consume resources only when needed, while retaining clear, verifiable identities when they communicate. Cost controls and security controls should not have to be competing priorities.

## More to watch in 1.37

The release has other changes that matter for modern AI and cloud-native workloads.

- **Dynamic Resource Allocation (DRA):** Extended-resource support reaches Stable, which lets DRA drivers fulfill traditional requests such as `example.com/gpu` without a separate device plugin. There are also improvements around NUMA awareness and device compatibility groups — useful when scheduling complex accelerator hardware. [Kubernetes’ DRA update](https://kubernetes.io/blog/2026/09/03/kubernetes-v1-37-dra-updates/) is worth a read.
- **Gang scheduling:** Beta support brings all-or-nothing scheduling for defined groups of Pods, along with workload-aware preemption and PodGroup queueing. That is especially relevant for distributed training and HPC jobs, where a partially scheduled job can hold resources without making progress. It is Beta but [disabled by default](https://kubernetes.io/docs/concepts/scheduling-eviction/gang-scheduling/), so teams should evaluate it deliberately.
- **Metrics API:** `metrics.k8s.io` graduates to Stable, reinforcing an API that already underpins `kubectl top` and resource-metrics-based autoscaling. This is an API-stability milestone rather than a new metric collection system. [Read the announcement](https://kubernetes.io/blog/2026/08/27/kubernetes-v1-37-metrics-api-ga/).

## A practical adoption checklist

Before enabling either headline feature broadly, I would start with a small, observable workload:

1. Choose a queue consumer with a durable external metric and measure its cold-start time.
2. Test scale-up, scale-down, metric-adapter failure, and manual pause behavior.
3. Define the certificate issuer, trust-bundle distribution, and renewal ownership for Pod Certificates.
4. Confirm that services reload certificate files safely during rotation.
5. Add dashboards for replica count, queue age, certificate expiry, and failed authentication.

Kubernetes 1.37 does not remove the need for sound platform design. It does, however, offer stronger native primitives for building platforms that are more economical when idle and more trustworthy when busy.
